namespace Application.Interfaces
{
    public interface IPasswordHasher
    {
        /// <summary>
        /// Genera un hash seguro utilizando BCrypt (Enhanced con pre-hashing SHA-384).
        /// </summary>
        string HashPassword(string password);

        /// <summary>
        /// Verifica si una contraseña en texto plano coincide con un hash BCrypt.
        /// </summary>
        bool VerifyPassword(string password, string hashedPassword);

        /// <summary>
        /// Determina si una cadena ya tiene el formato de un hash BCrypt válido ($2a$, $2b$, $2y$).
        /// </summary>
        bool IsHashed(string text);

        /// <summary>
        /// Verifica si el hash requiere ser recalculado por incremento del factor de trabajo (Work Factor).
        /// </summary>
        bool NeedsRehash(string hashedPassword);

        /// <summary>
        /// Ejecuta una verificación ficticia para mitigar ataques de temporización (timing attacks).
        /// </summary>
        void PerformDummyVerification(string password);
    }
}
