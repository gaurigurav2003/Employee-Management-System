
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DepartmentService.Data;
using DepartmentService.Repositories;
using DepartmentService.Services;
using DepartmentService.Common.Middleware;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Department Service",
        Version = "v1",
        Description = "Department Service API"
    });

    // JWT Authentication in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description =
            "Enter JWT token using the Bearer scheme. Example: Bearer {token}",

        Name = "Authorization",
        In = ParameterLocation.Header,

        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

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
            Array.Empty<string>()
        }
    });
});

// Database Configuration
builder.Services.AddDbContext<DepartmentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DepartmentDb")));

// JWT Authentication
builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!))
        };
    });

// Authorization
builder.Services.AddAuthorization();

// Dependency Injection
builder.Services.AddScoped<
    IDepartmentRepository,
    DepartmentRepository>();

builder.Services.AddScoped<
    IDepartmentService,
    DepartmentService.Services.DepartmentService>();

var app = builder.Build();

// Global Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Correlation ID Middleware
app.UseMiddleware<CorrelationIdMiddleware>();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Department Service v1");
    });
}

// HTTPS Redirection
app.UseHttpsRedirection();

// Authentication
app.UseAuthentication();

// Authorization
app.UseAuthorization();

// Map Controllers
app.MapControllers();

app.Run();