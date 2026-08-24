using Application.DTOs;
using Application.Interfaces;

namespace Application.UseCases
{
    public class LoginUseCase
    {
        private readonly IAuthService _authService;

        public LoginUseCase(IAuthService authService)
        {
            _authService = authService;
        }

        public async Task<LoginResponseDTO> ExecuteAsync(LoginDTO loginDTO)
        {
            if (loginDTO == null)
                throw new ArgumentNullException(nameof(loginDTO));

            var usuario = await _authService.ValidateUserAsync(loginDTO.Email, loginDTO.Contraseña);
            
            if (usuario == null)
                return null;

            var token = _authService.GenerateJwtToken(usuario);

            return new LoginResponseDTO
            {
                Id = usuario.Id,
                Email = usuario.Email,
                NombreUsuario = usuario.NombreUsuario,
                Token = token
            };
        }
    }
}