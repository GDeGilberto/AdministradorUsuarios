using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace Infrastructure.Services
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        private readonly int _workFactor;
        private readonly string _dummyHash;
        private static readonly Regex BCryptRegex = new(@"^\$2[abyx]\$\d{2}\$[./A-Za-z0-9]{53}$", RegexOptions.Compiled);

        public BCryptPasswordHasher(IConfiguration? configuration = null)
        {
            var configuredFactor = configuration?["SecuritySettings:BcryptWorkFactor"];
            _workFactor = int.TryParse(configuredFactor, out var factor) && factor >= 4 && factor <= 31 
                ? factor 
                : 11;

            // Generar el hash ficticio dinámicamente con el WorkFactor configurado
            _dummyHash = BCrypt.Net.BCrypt.EnhancedHashPassword("dummy-timing-attack-protection-seed", workFactor: _workFactor);
        }

        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("La contraseña no puede ser nula ni vacía.", nameof(password));

            return BCrypt.Net.BCrypt.EnhancedHashPassword(password, workFactor: _workFactor);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                return BCrypt.Net.BCrypt.EnhancedVerify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }

        public bool IsHashed(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return false;

            return BCryptRegex.IsMatch(text);
        }

        public bool NeedsRehash(string hashedPassword)
        {
            if (!IsHashed(hashedPassword))
                return true;

            try
            {
                return BCrypt.Net.BCrypt.PasswordNeedsRehash(hashedPassword, _workFactor);
            }
            catch
            {
                return true;
            }
        }

        public void PerformDummyVerification(string password)
        {
            VerifyPassword(password, _dummyHash);
        }
    }
}
