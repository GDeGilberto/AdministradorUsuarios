using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;

namespace Application.UseCases
{
    public class AddUsuarioUseCase<TDTO>
    {
        private readonly IRepository<Usuario> _repository;
        private readonly IMapper<TDTO, Usuario> _mapper;
        private readonly IPresenter<Usuario, UsuarioResponseDTO> _presenter;

        public AddUsuarioUseCase(
            IRepository<Usuario> repository, 
            IMapper<TDTO, Usuario> mapper,
            IPresenter<Usuario, UsuarioResponseDTO> presenter)
        {
            _repository = repository;
            _mapper = mapper;
            _presenter = presenter;
        }

        public async Task<UsuarioResponseDTO> ExecuteAsync(TDTO usuarioDTO)
        {
            var usuario = _mapper.ToEntity(usuarioDTO);
            await _repository.AddAsync(usuario);
            return _presenter.Present(new[] { usuario }).First();
        }
    }
}
