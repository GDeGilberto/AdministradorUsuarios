using Infrastructure.Services;
using Xunit;

namespace Infrastructure.Tests
{
    public class BCryptPasswordHasherTests
    {
        private readonly BCryptPasswordHasher _hasher = new();

        [Fact]
        public void HashPassword_ShouldProduceValidBCryptHash()
        {
            // Arrange
            var password = "SuperSecretPassword123!";

            // Act
            var hash = _hasher.HashPassword(password);

            // Assert
            Assert.NotNull(hash);
            Assert.True(_hasher.IsHashed(hash));
            Assert.StartsWith("$2", hash);
            Assert.Equal(60, hash.Length);
        }

        [Fact]
        public void HashPassword_ShouldProduceDifferentSaltsForSamePassword()
        {
            // Arrange
            var password = "SamePassword456$";

            // Act
            var hash1 = _hasher.HashPassword(password);
            var hash2 = _hasher.HashPassword(password);

            // Assert
            Assert.NotEqual(hash1, hash2);
            Assert.True(_hasher.VerifyPassword(password, hash1));
            Assert.True(_hasher.VerifyPassword(password, hash2));
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrue_ForMatchingPassword()
        {
            // Arrange
            var password = "MyP@ssw0rdValid!";
            var hash = _hasher.HashPassword(password);

            // Act
            var result = _hasher.VerifyPassword(password, hash);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalse_ForWrongPassword()
        {
            // Arrange
            var password = "CorrectPassword1!";
            var wrongPassword = "WrongPassword2@";
            var hash = _hasher.HashPassword(password);

            // Act
            var result = _hasher.VerifyPassword(wrongPassword, hash);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void VerifyPassword_ShouldSupportLongPasswordsBeyond72Characters()
        {
            // Arrange - Generar contraseña de más de 72 caracteres para verificar mitigación del límite de BCrypt
            var longPassword = new string('A', 80) + "P@ssw0rd999!";
            var differentLongPassword = new string('A', 80) + "P@ssw0rd000!";

            // Act
            var hash = _hasher.HashPassword(longPassword);

            // Assert
            Assert.True(_hasher.VerifyPassword(longPassword, hash));
            // Asegurar que no hubo truncamiento silencioso donde los primeros 72 caracteres basten
            Assert.False(_hasher.VerifyPassword(differentLongPassword, hash));
        }

        [Theory]
        [InlineData("plainTextPassword123", false)]
        [InlineData("Admin123!", false)]
        [InlineData("", false)]
        [InlineData(null, false)]
        public void IsHashed_ShouldReturnFalse_ForNonBCryptStrings(string? input, bool expected)
        {
            // Act
            var result = _hasher.IsHashed(input!);

            // Assert
            Assert.Equal(expected, result);
        }
    }
}
