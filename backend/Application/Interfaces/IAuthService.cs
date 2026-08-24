using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<Usuario> ValidateUserAsync(string email, string contraseña);
        string GenerateJwtToken(Usuario usuario);
    }
}