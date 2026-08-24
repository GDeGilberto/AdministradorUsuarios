using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;

namespace Application.Mappers
{
    public class AddUsuarioMapper : IMapper<AddUsuarioRequestDTO, Usuario>
    {
        public Usuario ToEntity(AddUsuarioRequestDTO dto)
        {
            return new Usuario(
                dto.Email,
                dto.NombreUsuario,
                dto.Contraseña,
                EstatusEnum.Activo,
                dto.Sexo
            );
        }
    }
}