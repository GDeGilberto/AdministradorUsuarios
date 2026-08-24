using Domain.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Usuario
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; private set; }

        [Required]
        [EmailAddress]
        public string Email { get; private set; }

        [Required]
        [MinLength(7)]
        public string NombreUsuario { get; private set; }

        [Required]
        public string Contraseña { get; private set; }

        [Required]
        public EstatusEnum Estatus { get; private set; }

        [Required]
        public SexoEnum Sexo { get; private set; }

        public DateTime FechaDeCreacion { get; private set; }

        public Usuario(string email, string nombreUsuario, string contraseña, EstatusEnum estatus, SexoEnum sexo)
        {
            Email = email;
            NombreUsuario = nombreUsuario;
            Contraseña = contraseña;
            Estatus = estatus;
            Sexo = sexo;
            FechaDeCreacion = DateTime.Now;
        }

        public void SetId(int id) => Id = id;

    }
}

