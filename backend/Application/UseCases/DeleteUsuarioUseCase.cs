using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;

namespace Application.UseCases
{
    public class DeleteUsuarioUseCase
    {
        private readonly IRepository<Usuario> _repository;

        public DeleteUsuarioUseCase(IRepository<Usuario> repository)
        {
            _repository = repository;
        }

        public async Task ExecuteAsync(int usuarioId)
        {
            var usuario = await _repository.GetByIdAsync(usuarioId);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {usuarioId} no encontrado");

            var usuarioInactivo = new Usuario(
                usuario.Email,
                usuario.NombreUsuario,
                usuario.Contraseña,
                EstatusEnum.Inactivo,
                usuario.Sexo
            );
            usuarioInactivo.SetId(usuarioId);

            await _repository.UpdateAsync(usuarioInactivo);
        }
    }
}
