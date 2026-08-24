using Domain.Enum;

namespace Application.DTOs
{
    public class UsuarioResponseDTO
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string NombreUsuario { get; set; }
        public EstatusEnum Estatus { get; set; }
        public SexoEnum Sexo { get; set; }
        public DateTime FechaDeCreacion { get; set; }
    }
}