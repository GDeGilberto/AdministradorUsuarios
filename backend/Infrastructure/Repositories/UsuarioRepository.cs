using System.ComponentModel.DataAnnotations;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enum;
using Infrastructure.Data;
using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UsuarioRepository : IRepository<Usuario>
    {
        private readonly ApplicationDbContext _db;

        public UsuarioRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(Usuario entity)
        {
            var existingEmail = await _db.Usuarios.AnyAsync(u => u.Email.ToLower() == entity.Email.ToLower());
            if (existingEmail)
            {
                throw new ValidationException("El correo electrónico ya se encuentra registrado.");
            }

            var existingUsername = await _db.Usuarios.AnyAsync(u => u.NombreUsuario.ToLower() == entity.NombreUsuario.ToLower());
            if (existingUsername)
            {
                throw new ValidationException("El nombre de usuario ya se encuentra registrado.");
            }

            UsuarioModel usuario = new()
            {
                Email = entity.Email,
                NombreUsuario = entity.NombreUsuario,
                Contraseña = entity.Contraseña,
                Estatus = entity.Estatus == EstatusEnum.Activo,
                Sexo = entity.Sexo,
                FechaDeCreacion = DateTime.UtcNow
            };

            try
            {
                await _db.Usuarios.AddAsync(usuario);
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException?.Message.Contains("IX_Usuarios_Email") == true)
                {
                    throw new ValidationException("El correo electrónico ya se encuentra registrado.");
                }
                if (ex.InnerException?.Message.Contains("IX_Usuarios_NombreUsuario") == true)
                {
                    throw new ValidationException("El nombre de usuario ya se encuentra registrado.");
                }
                throw new ValidationException("Ya existe un usuario con los mismos datos.");
            }
            
            // Set the generated Id back to the domain entity
            entity.SetId(usuario.Id);
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            var usuarios = await _db.Usuarios.ToListAsync();
            return usuarios.Select(u =>
            {
                var usuario = new Usuario(
                    u.Email,
                    u.NombreUsuario,
                    u.Contraseña,
                    u.Estatus ? EstatusEnum.Activo : EstatusEnum.Inactivo,
                    u.Sexo
                );
                usuario.SetId(u.Id);
                return usuario;
            });
        }

        public async Task<Usuario> GetByIdAsync(int id)
        {
            var usuarioModel = await _db.Usuarios.FindAsync(id);
            if (usuarioModel == null)
                return null;

            var usuario = new Usuario(
                usuarioModel.Email,
                usuarioModel.NombreUsuario,
                usuarioModel.Contraseña,
                usuarioModel.Estatus ? EstatusEnum.Activo : EstatusEnum.Inactivo,
                usuarioModel.Sexo
            );
            usuario.SetId(usuarioModel.Id);
            return usuario;
        }

        public async Task UpdateAsync(Usuario entity)
        {
            var usuario = await _db.Usuarios.FindAsync(entity.Id);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {entity.Id} no encontrado");

            var existingEmail = await _db.Usuarios.AnyAsync(u => u.Id != entity.Id && u.Email.ToLower() == entity.Email.ToLower());
            if (existingEmail)
            {
                throw new ValidationException("El correo electrónico ya se encuentra en uso por otro usuario.");
            }

            var existingUsername = await _db.Usuarios.AnyAsync(u => u.Id != entity.Id && u.NombreUsuario.ToLower() == entity.NombreUsuario.ToLower());
            if (existingUsername)
            {
                throw new ValidationException("El nombre de usuario ya se encuentra en uso por otro usuario.");
            }

            usuario.Email = entity.Email;
            usuario.NombreUsuario = entity.NombreUsuario;
            if (!string.IsNullOrWhiteSpace(entity.Contraseña))
            {
                usuario.Contraseña = entity.Contraseña;
            }
            usuario.Estatus = entity.Estatus == EstatusEnum.Activo;
            usuario.Sexo = entity.Sexo;

            try
            {
                _db.Usuarios.Update(usuario);
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new ValidationException("Ya existe otro usuario con el mismo correo o nombre de usuario.");
            }
        }
    }
}
