using Application.DTOs;
using Application.Interfaces;
using Application.Mappers;
using Application.Presenters;
using Application.UseCases;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- CARGAR ARCHIVO .ENV PARA DESARROLLO LOCAL ---
var currentDir = Directory.GetCurrentDirectory();
while (currentDir != null)
{
    var envPath = Path.Combine(currentDir, ".env");
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
            var parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                var key = parts[0].Trim();
                var value = parts[1].Trim();
                Environment.SetEnvironmentVariable(key, value);
            }
        }
        break;
    }
    currentDir = Directory.GetParent(currentDir)?.FullName;
}
// ------------------------------------------------

builder.Services.AddControllers();

// Configure CORS for Angular client
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
                        ?? builder.Configuration["JwtSettings:SecretKey"]
                        ?? "YOUR_JWT_SECRET_KEY_PLACEHOLDER_CHANGE_IN_ENVIRONMENT";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "Backend API", 
        Version = "v1",
        Description = "API para gestión de usuarios"
    });
    
    // Define the JWT security scheme
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer", // Must be lowercase
        BearerFormat = "JWT"
    });

    // Make sure Swagger UI requires a JWT token
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure DbContext with Dynamic Connection String from environment variables
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("YOUR_DATABASE_SERVER"))
{
    var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? "localhost";
    var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "AdministradorEmpleadosDb";
    var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "sa";
    var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
    var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";

    // Si corre de manera local fuera de Docker, "database" debe apuntar a "localhost"
    if (dbServer == "database")
    {
        dbServer = "localhost";
    }

    connectionString = $"Host={dbServer};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword};";
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Repositories
builder.Services.AddScoped<IRepository<Usuario>, UsuarioRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();

// Register Mappers & Presenters
builder.Services.AddScoped<IMapper<AddUsuarioRequestDTO, Usuario>, AddUsuarioMapper>();
builder.Services.AddScoped<IPresenter<Usuario, UsuarioResponseDTO>, UsuarioPresenter>();

// Register Use Cases
builder.Services.AddScoped<AddUsuarioUseCase<AddUsuarioRequestDTO>>();
builder.Services.AddScoped<GetUsuarioUseCase<Usuario, UsuarioResponseDTO>>();
builder.Services.AddScoped<UpdateUsuarioUseCase>();
builder.Services.AddScoped<DeleteUsuarioUseCase>();
builder.Services.AddScoped<LoginUseCase>();

var app = builder.Build();

// Ensure database is created with resilience
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        int retries = 5;

        while (retries > 0)
        {
            try
            {
                context.Database.EnsureCreated();
                break;
            }
            catch (Exception ex)
            {
                retries--;
                if (retries == 0)
                {
                    logger.LogError(ex, "An error occurred while creating the database after multiple retries.");
                    throw;
                }
                logger.LogWarning("Database not ready yet. Retrying in 5 seconds... ({Retries} retries left)", retries);
                System.Threading.Thread.Sleep(5000);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Fatal error: Could not initialize database.");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
        // c.RoutePrefix = string.Empty;
        // Display the authorize button at the top of the page
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        // Make the authorization persist after page refresh
        c.DisplayOperationId();
        c.EnablePersistAuthorization();
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
