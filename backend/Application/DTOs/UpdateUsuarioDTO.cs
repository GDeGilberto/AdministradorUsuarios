using System.ComponentModel.DataAnnotations;
using Domain.Enum;

namespace Application.DTOs
{
    public class UpdateUsuarioDTO
    {
        [EmailAddress]
        public string? Email { get; set; }

        [MinLength(7)]
        public string? NombreUsuario { get; set; }

        [MinLength(10)]
        public string? Contraseña { get; set; }

        [MinLength(10)]
        [Compare("Contraseña", ErrorMessage = "Las contraseñas no coinciden")]
        public string? ConfirmarContraseña { get; set; }

        public SexoEnum? Sexo { get; set; }
    }
}