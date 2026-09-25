using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using AttendanceService.Common.Models;

namespace AttendanceService.Common.Middleware
{
    public class GlobalExceptionMiddleware
    {
        public const string CorrelationIdHeader = "X-Correlation-Id";
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var correlationId = context.Items["CorrelationId"]?.ToString();
            if (string.IsNullOrWhiteSpace(correlationId))
            {
                if (context.Request.Headers.TryGetValue(CorrelationIdHeader, out var headerValue) && !string.IsNullOrWhiteSpace(headerValue))
                {
                    correlationId = headerValue.ToString();
                }
                else
                {
                    correlationId = Guid.NewGuid().ToString();
                }
                context.Items["CorrelationId"] = correlationId;
            }

            if (!context.Response.Headers.ContainsKey(CorrelationIdHeader))
            {
                context.Response.Headers[CorrelationIdHeader] = correlationId;
            }

            var statusCode = HttpStatusCode.InternalServerError;
            string message = "An unexpected error occurred.";
            string? details = null;

            switch (exception)
            {
                case KeyNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;
                case ArgumentException:
                    statusCode = HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;
                case UnauthorizedAccessException:
                    statusCode = HttpStatusCode.Forbidden;
                    message = "You do not have permission to access this resource.";
                    break;
                default:
                    statusCode = HttpStatusCode.InternalServerError;
                    message = "An unexpected error occurred.";
                    if (_env.IsDevelopment())
                    {
                        details = exception.Message;
                    }
                    break;
            }

            _logger.LogError(exception, "Unhandled exception occurred. [CorrelationId: {CorrelationId}]", correlationId);

            if (!context.Response.HasStarted)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)statusCode;

                var response = new ErrorResponse
                {
                    StatusCode = (int)statusCode,
                    Message = message,
                    CorrelationId = correlationId,
                    Details = details
                };

                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
            }
        }
    }
}
