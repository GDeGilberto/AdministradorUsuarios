using Application.Interfaces;

namespace Application.UseCases
{
    public class GetUsuarioUseCase<TEntity, TOutput>
    {
        private readonly IRepository<TEntity> _repository;
        private readonly IPresenter<TEntity, TOutput> _presenter;

        public GetUsuarioUseCase(IRepository<TEntity> repository, 
            IPresenter<TEntity, TOutput> presenter)
        {
            _repository = repository;
            _presenter = presenter;
        }

        public async Task<IEnumerable<TOutput>> ExecuteAsync()
        {
            var usuarios = await _repository.GetAllAsync();
            return _presenter.Present(usuarios);
        }
    }
}
