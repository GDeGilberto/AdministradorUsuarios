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

        public UsuarioController(
            AddUsuarioUseCase<AddUsuarioRequestDTO> addUsuarioUseCase,
            GetUsuarioUseCase<Usuario, UsuarioResponseDTO> getUsuarioUseCase,
            UpdateUsuarioUseCase updateUsuarioUseCase,
            DeleteUsuarioUseCase deleteUsuarioUseCase,
            LoginUseCase loginUseCase)
        {
            _addUsuarioUseCase = addUsuarioUseCase;
            _getUsuarioUseCase = getUsuarioUseCase;
            _updateUsuarioUseCase = updateUsuarioUseCase;
            _deleteUsuarioUseCase = deleteUsuarioUseCase;
            _loginUseCase = loginUseCase;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<UsuarioResponseDTO>>> GetUsuarios()
        {
            var usuarios = await _getUsuarioUseCase.ExecuteAsync();
            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<ActionResult<UsuarioResponseDTO>> CreateUsuario([FromBody] AddUsuarioRequestDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var usuario = await _addUsuarioUseCase.ExecuteAsync(usuarioDTO);
            return CreatedAtAction(nameof(GetUsuarios), new { id = usuario.Id }, usuario);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult> UpdateUsuario(int id, [FromBody] UpdateUsuarioDTO usuarioDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _updateUsuarioUseCase.ExecuteAsync(id, usuarioDTO);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ValidationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteUsuario(int id)
        {
            try
            {
                await _deleteUsuarioUseCase.ExecuteAsync(id);
                return Ok();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _loginUseCase.ExecuteAsync(loginDTO);
            
            if (response == null)
                return Unauthorized("Email o contraseña incorrectos");

            return Ok(response);
        }
    }
}
