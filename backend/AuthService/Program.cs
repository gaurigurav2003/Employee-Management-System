using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure DbContext (SQL Server)
var connectionString = builder.Configuration.GetConnectionString("AuthDb");
if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AuthService.Data.AuthDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// DI
builder.Services.AddScoped<AuthService.Repositories.IUserRepository, AuthService.Repositories.UserRepository>();
builder.Services.AddScoped<AuthService.Services.IAuthService, AuthService.Services.AuthService>();
builder.Services.AddSingleton<AuthService.Security.PasswordHasher>();

// OpenAPI/Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
