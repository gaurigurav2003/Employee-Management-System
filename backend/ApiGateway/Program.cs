var builder = WebApplication.CreateBuilder(args);

// API Gateway uses YARP for configuration-based reverse proxy routing.
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// CORS is configurable through appsettings.json.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseCors("Frontend");

// Simple gateway health endpoint. It does not access any database or downstream service.
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "ApiGateway"
}));

// YARP forwards the incoming Authorization header and other normal request headers
// to the selected downstream service. Authentication/authorization remains in each service.
app.MapReverseProxy();

app.Run();
