using Application.UseCases;
using Application.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly AddUsuarioUseCase<AddUsuarioRequestDTO> _addUsuarioUseCase;
        private readonly GetUsuarioUseCase<Usuario, UsuarioResponseDTO> _getUsuarioUseCase;
        private readonly UpdateUsuarioUseCase _updateUsuarioUseCase;
        private readonly DeleteUsuarioUseCase _deleteUsuarioUseCase;
        private readonly LoginUseCase _loginUseCase;
        private readonly ILogger<UsuarioController> _logger;

        public UsuarioController(
            AddUsuarioUseCase<AddUsuarioRequestDTO> addUsuarioUseCase,
            GetUsuarioUseCase<Usuario, UsuarioResponseDTO> getUsuarioUseCase,
            UpdateUsuarioUseCase updateUsuarioUseCase,
            DeleteUsuarioUseCase deleteUsuarioUseCase,
            LoginUseCase loginUseCase,
            ILogger<UsuarioController> logger)
        {
            _addUsuarioUseCase = addUsuarioUseCase;
            _getUsuarioUseCase = getUsuarioUseCase;
            _updateUsuarioUseCase = updateUsuarioUseCase;
            _deleteUsuarioUseCase = deleteUsuarioUseCase;
            _loginUseCase = loginUseCase;
            _logger = logger;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<UsuarioResponseDTO>>> GetUsuarios()
        {
            _logger.LogInformation("Consultando lista de usuarios del sistema");
            var usuarios = await _getUsuarioUseCase.ExecuteAsync();
            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<ActionResult<UsuarioResponseDTO>> CreateUsuario([FromBody] AddUsuarioRequestDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Intento de creación de usuario con modelo inválido: {Email}", usuarioDTO?.Email);
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Iniciando creación de usuario para el correo: {Email}", usuarioDTO.Email);

            try
            {
                var usuario = await _addUsuarioUseCase.ExecuteAsync(usuarioDTO);
                _logger.LogInformation("Usuario creado exitosamente con ID: {Id} y Email: {Email}", usuario.Id, usuario.Email);
                return CreatedAtAction(nameof(GetUsuarios), new { id = usuario.Id }, usuario);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Validación fallida al crear usuario {Email}: {Message}", usuarioDTO.Email, ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear usuario {Email}: {Message}", usuarioDTO.Email, ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateUsuario(int id, [FromBody] UpdateUsuarioDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Intento de actualización con modelo inválido para el usuario ID: {Id}", id);
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Iniciando actualización para el usuario con ID: {Id}", id);

            try
            {
                await _updateUsuarioUseCase.ExecuteAsync(id, usuarioDTO);
                _logger.LogInformation("Usuario con ID: {Id} actualizado exitosamente", id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Usuario con ID: {Id} no encontrado para actualización", id);
                return NotFound(ex.Message);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Validación fallida al actualizar usuario con ID {Id}: {Message}", id, ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteUsuario(int id)
        {
            _logger.LogInformation("Iniciando desactivación/eliminación para el usuario con ID: {Id}", id);

            try
            {
                await _deleteUsuarioUseCase.ExecuteAsync(id);
                _logger.LogInformation("Usuario con ID: {Id} desactivado exitosamente", id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Usuario con ID: {Id} no encontrado para eliminación", id);
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Intento de login con modelo inválido");
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Intento de inicio de sesión para el correo: {Email}", loginDTO.Email);

            var response = await _loginUseCase.ExecuteAsync(loginDTO);
            
            if (response == null)
            {
                _logger.LogWarning("Inicio de sesión fallido para el correo: {Email} (credenciales inválidas o cuenta inactiva)", loginDTO.Email);
                return Unauthorized("Email o contraseña incorrectos");
            }

            _logger.LogInformation("Inicio de sesión exitoso para el correo: {Email}", loginDTO.Email);
            return Ok(response);
        }
    }
}
