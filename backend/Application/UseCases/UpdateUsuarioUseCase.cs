using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Application.UseCases
{
    public class UpdateUsuarioUseCase
    {
        private readonly IRepository<Usuario> _repository;

        public UpdateUsuarioUseCase(IRepository<Usuario> repository)
        {
            _repository = repository;
        }

        public async Task ExecuteAsync(int id, UpdateUsuarioDTO usuarioDTO)
        {
            if (usuarioDTO == null)
                throw new ArgumentNullException(nameof(usuarioDTO));

            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {id} no encontrado");

            var validationContext = new ValidationContext(usuarioDTO);
            Validator.ValidateObject(usuarioDTO, validationContext, true);

            if (!string.IsNullOrEmpty(usuarioDTO.Contraseña))
            {
                if (usuarioDTO.Contraseña != usuarioDTO.ConfirmarContraseña)
                    throw new ValidationException("Las contraseñas no coinciden");
            }

            var updatedUsuario = new Usuario(
                usuarioDTO.Email ?? usuario.Email,
                usuarioDTO.NombreUsuario ?? usuario.NombreUsuario,
                usuarioDTO.Contraseña ?? usuario.Contraseña,
                usuario.Estatus,
                usuarioDTO.Sexo ?? usuario.Sexo
            );
            updatedUsuario.SetId(id);

            await _repository.UpdateAsync(updatedUsuario);
        }
    }
}
