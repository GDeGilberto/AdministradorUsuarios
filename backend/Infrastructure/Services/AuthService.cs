using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext db, 
            IConfiguration configuration,
            IPasswordHasher passwordHasher,
            ILogger<AuthService>? logger = null)
        {
            _db = db;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
            _logger = logger ?? NullLogger<AuthService>.Instance;
        }

        public async Task<Usuario> ValidateUserAsync(string email, string contraseña)
        {
            _logger.LogInformation("Iniciando validación de credenciales para el usuario con email: {Email}", email);

            // Buscar el usuario por email
            var usuarioModel = await _db.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email && u.Estatus == true);

            if (usuarioModel == null)
            {
                _logger.LogWarning("Intento de autenticación fallido: no existe o está inactivo el usuario con email: {Email}", email);
                // Mitigación de Timing Attack: ejecuta cómputo de BCrypt para igualar tiempos de respuesta
                _passwordHasher.PerformDummyVerification(contraseña);
                return null!;
            }

            bool isValid = false;

            // 1. Verificación para contraseñas legadas en texto plano (Zero-Downtime Migration)
            if (!_passwordHasher.IsHashed(usuarioModel.Contraseña))
            {
                if (usuarioModel.Contraseña == contraseña)
                {
                    isValid = true;
                    _logger.LogInformation("Actualizando contraseña heredada a BCrypt (Transparent Rehash) para el usuario con email: {Email}", email);
                    // Actualización transparente inmediata a BCrypt en la base de datos
                    usuarioModel.Contraseña = _passwordHasher.HashPassword(contraseña);
                    await _db.SaveChangesAsync();
                }
            }
            else
            {
                // 2. Verificación estándar con BCrypt
                isValid = _passwordHasher.VerifyPassword(contraseña, usuarioModel.Contraseña);

                // Auto-upgrade si el factor de trabajo requiere actualización
                if (isValid && _passwordHasher.NeedsRehash(usuarioModel.Contraseña))
                {
                    _logger.LogInformation("Actualizando factor de trabajo de BCrypt para el usuario con email: {Email}", email);
                    usuarioModel.Contraseña = _passwordHasher.HashPassword(contraseña);
                    await _db.SaveChangesAsync();
                }
            }

            if (!isValid)
            {
                _logger.LogWarning("Intento de autenticación fallido: contraseña incorrecta para el usuario con email: {Email}", email);
                return null!;
            }

            _logger.LogInformation("Usuario autenticado exitosamente: {Email} (ID: {Id})", usuarioModel.Email, usuarioModel.Id);

            // Mapear a la entidad de dominio y devolver el usuario
            var usuario = new Usuario(
                usuarioModel.Email,
                usuarioModel.NombreUsuario,
                usuarioModel.Contraseña,
                EstatusEnum.Activo,
                usuarioModel.Sexo
            );
            usuario.SetId(usuarioModel.Id);

            return usuario;
        }

        public string GenerateJwtToken(Usuario usuario)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? 
                throw new InvalidOperationException("JWT secret key is not configured");
            
            var key = Encoding.ASCII.GetBytes(secretKey);
            var tokenExpiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Name, usuario.NombreUsuario),
                    new Claim(ClaimTypes.Email, usuario.Email)
                }),
                Expires = DateTime.UtcNow.AddMinutes(tokenExpiryMinutes),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),
                Issuer = issuer,
                Audience = audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            _logger.LogInformation("Token JWT generado exitosamente para el usuario ID: {Id}, Email: {Email}", usuario.Id, usuario.Email);
            return tokenHandler.WriteToken(token);
        }
    }
}