using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;

namespace Application.Mappers
{
    public class AddUsuarioMapper : IMapper<AddUsuarioRequestDTO, Usuario>
    {
        private readonly IPasswordHasher _passwordHasher;

        public AddUsuarioMapper(IPasswordHasher passwordHasher)
        {
            _passwordHasher = passwordHasher;
        }

        public Usuario ToEntity(AddUsuarioRequestDTO dto)
        {
            return new Usuario(
                dto.Email,
                dto.NombreUsuario,
                _passwordHasher.HashPassword(dto.Contraseña),
                EstatusEnum.Activo,
                dto.Sexo
            );
        }
    }
}