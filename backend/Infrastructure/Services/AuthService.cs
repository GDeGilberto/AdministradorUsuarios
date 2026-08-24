using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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

        public AuthService(ApplicationDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
        }

        public async Task<Usuario> ValidateUserAsync(string email, string contraseña)
        {
            // Buscar el usuario por email
            var usuarioModel = await _db.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email && u.Estatus == true);

            if (usuarioModel == null)
                return null;

            // Verificar la contraseña
            if (usuarioModel.Contraseña != contraseña)
                return null;

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
            return tokenHandler.WriteToken(token);
        }
    }
}