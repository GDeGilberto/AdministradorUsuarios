using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.Presenters
{
    public class UsuarioPresenter : IPresenter<Usuario, UsuarioResponseDTO>
    {
        public IEnumerable<UsuarioResponseDTO> Present(IEnumerable<Usuario> data)
        {
            return data.Select(u => new UsuarioResponseDTO
            {
                Id = u.Id,
                Email = u.Email,
                NombreUsuario = u.NombreUsuario,
                Estatus = u.Estatus,
                Sexo = u.Sexo,
                FechaDeCreacion = u.FechaDeCreacion
            });
        }
    }
}