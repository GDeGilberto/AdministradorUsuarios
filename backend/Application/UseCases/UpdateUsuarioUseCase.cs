using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace Application.UseCases
{
    public class UpdateUsuarioUseCase
    {
        private readonly IRepository<Usuario> _repository;
        private readonly IPasswordHasher _passwordHasher;

        public UpdateUsuarioUseCase(IRepository<Usuario> repository, IPasswordHasher passwordHasher)
        {
            _repository = repository;
            _passwordHasher = passwordHasher;
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

            string passwordToPersist;
            if (!string.IsNullOrEmpty(usuarioDTO.Contraseña))
            {
                if (usuarioDTO.Contraseña != usuarioDTO.ConfirmarContraseña)
                    throw new ValidationException("Las contraseñas no coinciden");

                passwordToPersist = _passwordHasher.HashPassword(usuarioDTO.Contraseña);
            }
            else
            {
                passwordToPersist = usuario.Contraseña;
            }

            var updatedUsuario = new Usuario(
                usuarioDTO.Email ?? usuario.Email,
                usuarioDTO.NombreUsuario ?? usuario.NombreUsuario,
                passwordToPersist,
                usuario.Estatus,
                usuarioDTO.Sexo ?? usuario.Sexo
            );
            updatedUsuario.SetId(id);

            await _repository.UpdateAsync(updatedUsuario);
        }
    }
}
