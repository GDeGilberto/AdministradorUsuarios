using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Contraseña { get; set; }
    }

    public class LoginResponseDTO
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string NombreUsuario { get; set; }
        public string Token { get; set; }
    }
}