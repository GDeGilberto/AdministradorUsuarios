using Infrastructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options) { }

        public DbSet<UsuarioModel> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UsuarioModel>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                    .ValueGeneratedOnAdd()
                    .IsRequired();

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasColumnType("varchar")
                    .HasAnnotation("RegularExpression", @"^[^@\s]+@[^@\s]+\.[^@\s]+$")
                    .HasAnnotation("ErrorMessage", "El formato del correo electrónico no es válido");

                entity.Property(u => u.NombreUsuario)
                    .IsRequired()
                    .HasMaxLength(100)
                    .HasColumnType("varchar")
                    .HasAnnotation("MinLength", 7)
                    .HasAnnotation("ErrorMessage", "El nombre de usuario debe tener al menos 7 caracteres");

                entity.Property(u => u.Contraseña)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasColumnType("varchar")
                    .HasAnnotation("MinLength", 10)
                    .HasAnnotation("RegularExpression", @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,}$")
                    .HasAnnotation("ErrorMessage", "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo");

                entity.Property(u => u.Estatus)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(u => u.Sexo)
                    .IsRequired()
                    .HasConversion<string>();

                entity.Property(u => u.FechaDeCreacion)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .ValueGeneratedOnAdd();

                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.NombreUsuario).IsUnique();
            });
        }
    }
}
