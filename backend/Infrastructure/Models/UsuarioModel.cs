using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enum;

namespace Infrastructure.Models
{
    public class UsuarioModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required]
        public string Contraseña { get; set; } = string.Empty;

        [Required]
        public bool Estatus { get; set; } = true;

        [Required]
        public SexoEnum Sexo { get; set; }

        [Required]
        public DateTime FechaDeCreacion { get; set; } = DateTime.UtcNow;
    }
}
