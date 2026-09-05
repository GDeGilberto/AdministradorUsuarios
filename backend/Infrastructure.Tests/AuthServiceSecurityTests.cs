using Domain.Enum;
using Infrastructure.Data;
using Infrastructure.Models;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Infrastructure.Tests
{
    public class AuthServiceSecurityTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private IConfiguration CreateMockConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string>
            {
                { "JwtSettings:SecretKey", "SuperSecretKeyForTestingPurposesMustBeLongEnough12345!" },
                { "JwtSettings:ExpiryMinutes", "60" },
                { "JwtSettings:Issuer", "TestIssuer" },
                { "JwtSettings:Audience", "TestAudience" }
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
        }

        [Fact]
        public async Task ValidateUserAsync_WithPlainTextPassword_ShouldAuthenticateAndAutoUpgradeToBCrypt()
        {
            // Arrange - Simula un usuario previo en la base de datos con contraseña en texto plano
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();

            var plainPassword = "LegacyPassword123!";
            var legacyUser = new UsuarioModel
            {
                Email = "legacy@empresa.com",
                NombreUsuario = "legacyuser",
                Contraseña = plainPassword, // <--- Texto plano en BD
                Estatus = true,
                Sexo = SexoEnum.Masculino,
                FechaDeCreacion = DateTime.UtcNow
            };

            context.Usuarios.Add(legacyUser);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, config, hasher);

            // Act - Iniciar sesión con la contraseña en texto plano
            var result = await authService.ValidateUserAsync("legacy@empresa.com", plainPassword);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("legacy@empresa.com", result.Email);

            // Verificar que la base de datos se actualizó automáticamente (Transparent Rehash)
            var updatedUserInDb = await context.Usuarios.FirstAsync(u => u.Email == "legacy@empresa.com");
            Assert.NotEqual(plainPassword, updatedUserInDb.Contraseña);
            Assert.True(hasher.IsHashed(updatedUserInDb.Contraseña));
            Assert.True(hasher.VerifyPassword(plainPassword, updatedUserInDb.Contraseña));
        }

        [Fact]
        public async Task ValidateUserAsync_WithHashedPassword_ShouldAuthenticateSuccessfully()
        {
            // Arrange - Usuario con contraseña ya hasheada
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();

            var password = "SecurePassword123!";
            var hashedPassword = hasher.HashPassword(password);

            var user = new UsuarioModel
            {
                Email = "secure@empresa.com",
                NombreUsuario = "secureuser",
                Contraseña = hashedPassword,
                Estatus = true,
                Sexo = SexoEnum.Femenino,
                FechaDeCreacion = DateTime.UtcNow
            };

            context.Usuarios.Add(user);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, config, hasher);

            // Act
            var result = await authService.ValidateUserAsync("secure@empresa.com", password);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("secure@empresa.com", result.Email);
        }

        [Fact]
        public async Task ValidateUserAsync_WithWrongPassword_ShouldReturnNull()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();

            var password = "SecurePassword123!";
            var hashedPassword = hasher.HashPassword(password);

            var user = new UsuarioModel
            {
                Email = "user@empresa.com",
                NombreUsuario = "normaluser",
                Contraseña = hashedPassword,
                Estatus = true,
                Sexo = SexoEnum.Masculino,
                FechaDeCreacion = DateTime.UtcNow
            };

            context.Usuarios.Add(user);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, config, hasher);

            // Act
            var result = await authService.ValidateUserAsync("user@empresa.com", "WrongPassword999!");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task ValidateUserAsync_WithNonExistentUser_ShouldReturnNullSafely()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();
            var authService = new AuthService(context, config, hasher);

            // Act - Valida que la mitigación de Timing Attack (dummy verify) no falle
            var result = await authService.ValidateUserAsync("doesnotexist@empresa.com", "SomePassword123!");

            // Assert
            Assert.Null(result);
        }
    }
}
