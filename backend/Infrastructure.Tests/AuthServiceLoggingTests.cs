using Domain.Enum;
using Infrastructure.Data;
using Infrastructure.Models;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Infrastructure.Tests
{
    public class TestLogger<T> : ILogger<T>
    {
        public List<(LogLevel Level, string Message)> Logs { get; } = new();

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            Logs.Add((logLevel, formatter(state, exception)));
        }
    }

    public class AuthServiceLoggingTests
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
        public async Task ValidateUserAsync_WhenUserNotFound_ShouldLogWarning()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();
            var testLogger = new TestLogger<AuthService>();
            var authService = new AuthService(context, config, hasher, testLogger);

            // Act
            var result = await authService.ValidateUserAsync("inexistente@empresa.com", "Password123!");

            // Assert
            Assert.Null(result);
            Assert.Contains(testLogger.Logs, log => log.Level == LogLevel.Warning && log.Message.Contains("inexistente@empresa.com"));
        }

        [Fact]
        public async Task ValidateUserAsync_WhenPasswordIncorrect_ShouldLogWarning()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();
            var testLogger = new TestLogger<AuthService>();

            var user = new UsuarioModel
            {
                Email = "usuario@empresa.com",
                NombreUsuario = "usuario1",
                Contraseña = hasher.HashPassword("CorrectPassword123!"),
                Estatus = true,
                Sexo = SexoEnum.Femenino,
                FechaDeCreacion = DateTime.UtcNow
            };
            context.Usuarios.Add(user);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, config, hasher, testLogger);

            // Act
            var result = await authService.ValidateUserAsync("usuario@empresa.com", "WrongPassword999!");

            // Assert
            Assert.Null(result);
            Assert.Contains(testLogger.Logs, log => log.Level == LogLevel.Warning && log.Message.Contains("contraseña incorrecta"));
        }

        [Fact]
        public async Task ValidateUserAsync_WhenCredentialsValid_ShouldLogInformation()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();
            var testLogger = new TestLogger<AuthService>();

            var password = "CorrectPassword123!";
            var user = new UsuarioModel
            {
                Email = "valido@empresa.com",
                NombreUsuario = "validouser",
                Contraseña = hasher.HashPassword(password),
                Estatus = true,
                Sexo = SexoEnum.Masculino,
                FechaDeCreacion = DateTime.UtcNow
            };
            context.Usuarios.Add(user);
            await context.SaveChangesAsync();

            var authService = new AuthService(context, config, hasher, testLogger);

            // Act
            var result = await authService.ValidateUserAsync("valido@empresa.com", password);

            // Assert
            Assert.NotNull(result);
            Assert.Contains(testLogger.Logs, log => log.Level == LogLevel.Information && log.Message.Contains("autenticado exitosamente"));
        }

        [Fact]
        public void GenerateJwtToken_ShouldLogInformationWithUserContext()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var hasher = new BCryptPasswordHasher();
            var config = CreateMockConfiguration();
            var testLogger = new TestLogger<AuthService>();
            var authService = new AuthService(context, config, hasher, testLogger);

            var usuario = new Domain.Entities.Usuario("jwtuser@empresa.com", "jwtuser", "hash", EstatusEnum.Activo, SexoEnum.Masculino);
            usuario.SetId(42);

            // Act
            var token = authService.GenerateJwtToken(usuario);

            // Assert
            Assert.NotNull(token);
            Assert.Contains(testLogger.Logs, log => log.Level == LogLevel.Information && log.Message.Contains("jwtuser@empresa.com") && log.Message.Contains("42"));
        }
    }
}
