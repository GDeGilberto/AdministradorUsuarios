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
            UsuarioModel usuario = new()
            {
                Email = entity.Email,
                NombreUsuario = entity.NombreUsuario,
                Contraseña = entity.Contraseña,
                Estatus = entity.Estatus == EstatusEnum.Activo,
                Sexo = entity.Sexo,
                FechaDeCreacion = DateTime.UtcNow
            };

            await _db.Usuarios.AddAsync(usuario);
            await _db.SaveChangesAsync();
            
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

            usuario.Email = entity.Email;
            usuario.NombreUsuario = entity.NombreUsuario;
            usuario.Contraseña = entity.Contraseña;
            usuario.Estatus = entity.Estatus == EstatusEnum.Activo;
            usuario.Sexo = entity.Sexo;

            _db.Usuarios.Update(usuario);
            await _db.SaveChangesAsync();
        }
    }
}
