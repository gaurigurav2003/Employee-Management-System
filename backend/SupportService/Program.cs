using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SupportService.Data;
using SupportService.Repositories;
using SupportService.Services;
using SupportService.Common.Middleware;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers
builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();

// Swagger / API Explorer
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Support Service",
        Version = "v1",
        Description = "Support Service API"
    });

    // JWT Bearer Authentication in Swagger
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
builder.Services.AddDbContext<SupportDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("SupportDb")));

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
    ISupportTicketRepository,
    SupportTicketRepository>();

builder.Services.AddScoped<
    ISupportTicketService,
    SupportTicketService>();


builder.Services.AddHttpClient("EmployeeService", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["Services:EmployeeServiceUrl"]!);
});

builder.Services.AddScoped<EmployeeServiceClient>();

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
            "Support Service v1");
    });
}

// HTTPS
app.UseHttpsRedirection();

// Authentication
app.UseAuthentication();

// Authorization
app.UseAuthorization();

// Map Controllers
app.MapControllers();

app.Run();