using System.ComponentModel.DataAnnotations;
using Domain.Enum;

namespace Application.DTOs
{
    public class AddUsuarioRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(7)]
        public string NombreUsuario { get; set; }

        [Required]
        [MinLength(10)]
        public string Contraseña { get; set; }

        [Required]
        [Compare("Contraseña", ErrorMessage = "Las contraseñas no coinciden")]
        public string ConfirmarContraseña { get; set; }

        [Required]
        public SexoEnum Sexo { get; set; }
    }
}