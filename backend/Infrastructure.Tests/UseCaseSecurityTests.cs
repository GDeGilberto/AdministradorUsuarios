using Application.DTOs;
using Application.Interfaces;
using Application.Mappers;
using Application.UseCases;
using Domain.Entities;
using Domain.Enum;
using Infrastructure.Services;
using Xunit;

namespace Infrastructure.Tests
{
    // Fake Repository para probar UseCases sin acoplarse a base de datos física
    public class FakeUsuarioRepository : IRepository<Usuario>
    {
        private readonly List<Usuario> _usuarios = new();

        public void Seed(Usuario usuario) => _usuarios.Add(usuario);

        public Task AddAsync(Usuario entity)
        {
            _usuarios.Add(entity);
            return Task.CompletedTask;
        }

        public Task<Usuario> GetByIdAsync(int id)
        {
            var user = _usuarios.FirstOrDefault(u => u.Id == id);
            return Task.FromResult(user!);
        }

        public Task<IEnumerable<Usuario>> GetAllAsync()
        {
            return Task.FromResult<IEnumerable<Usuario>>(_usuarios);
        }

        public Task UpdateAsync(Usuario entity)
        {
            var index = _usuarios.FindIndex(u => u.Id == entity.Id);
            if (index >= 0)
            {
                _usuarios[index] = entity;
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(int id)
        {
            _usuarios.RemoveAll(u => u.Id == id);
            return Task.CompletedTask;
        }
    }

    public class UseCaseSecurityTests
    {
        private readonly BCryptPasswordHasher _hasher = new();

        [Fact]
        public void AddUsuarioMapper_ShouldHashPassword_WhenMappingToEntity()
        {
            // Arrange
            var mapper = new AddUsuarioMapper(_hasher);
            var rawPassword = "StrongPassword123!";
            var dto = new AddUsuarioRequestDTO
            {
                Email = "nuevo@empresa.com",
                NombreUsuario = "nuevousuario",
                Contraseña = rawPassword,
                ConfirmarContraseña = rawPassword,
                Sexo = SexoEnum.Femenino
            };

            // Act
            var entity = mapper.ToEntity(dto);

            // Assert
            Assert.NotNull(entity);
            Assert.NotEqual(rawPassword, entity.Contraseña);
            Assert.True(_hasher.IsHashed(entity.Contraseña));
            Assert.True(_hasher.VerifyPassword(rawPassword, entity.Contraseña));
        }

        [Fact]
        public async Task UpdateUsuarioUseCase_WhenPasswordProvided_ShouldHashNewPassword()
        {
            // Arrange
            var repository = new FakeUsuarioRepository();
            var initialPassword = "OldPassword123!";
            var initialHash = _hasher.HashPassword(initialPassword);

            var usuario = new Usuario("user@empresa.com", "username123", initialHash, EstatusEnum.Activo, SexoEnum.Masculino);
            usuario.SetId(1);
            repository.Seed(usuario);

            var useCase = new UpdateUsuarioUseCase(repository, _hasher);

            var newPassword = "NewPassword456!";
            var updateDto = new UpdateUsuarioDTO
            {
                NombreUsuario = "username123",
                Contraseña = newPassword,
                ConfirmarContraseña = newPassword
            };

            // Act
            await useCase.ExecuteAsync(1, updateDto);

            // Assert
            var updated = await repository.GetByIdAsync(1);
            Assert.NotNull(updated);
            Assert.NotEqual(initialHash, updated.Contraseña);
            Assert.NotEqual(newPassword, updated.Contraseña);
            Assert.True(_hasher.IsHashed(updated.Contraseña));
            Assert.True(_hasher.VerifyPassword(newPassword, updated.Contraseña));
        }

        [Fact]
        public async Task UpdateUsuarioUseCase_WhenPasswordNotProvided_ShouldPreserveExistingHashWithoutRehashing()
        {
            // Arrange
            var repository = new FakeUsuarioRepository();
            var password = "PreservedPassword123!";
            var existingHash = _hasher.HashPassword(password);

            var usuario = new Usuario("user@empresa.com", "username123", existingHash, EstatusEnum.Activo, SexoEnum.Masculino);
            usuario.SetId(2);
            repository.Seed(usuario);

            var useCase = new UpdateUsuarioUseCase(repository, _hasher);

            var updateDto = new UpdateUsuarioDTO
            {
                NombreUsuario = "updatedname",
                Contraseña = null,
                ConfirmarContraseña = null
            };

            // Act
            await useCase.ExecuteAsync(2, updateDto);

            // Assert
            var updated = await repository.GetByIdAsync(2);
            Assert.NotNull(updated);
            // El hash debe ser exactamente el mismo, no debe sufrir double-hashing
            Assert.Equal(existingHash, updated.Contraseña);
            Assert.Equal("updatedname", updated.NombreUsuario);
        }
    }
}
