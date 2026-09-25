using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace AuthService.Common.Middleware
{
    public class CorrelationIdMiddleware
    {
        public const string CorrelationIdHeader = "X-Correlation-Id";
        private readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string correlationId;
            if (context.Request.Headers.TryGetValue(CorrelationIdHeader, out var headerValue) && !string.IsNullOrWhiteSpace(headerValue))
            {
                correlationId = headerValue.ToString();
            }
            else
            {
                correlationId = Guid.NewGuid().ToString();
            }

            context.Items["CorrelationId"] = correlationId;

            context.Response.OnStarting(() =>
            {
                if (!context.Response.Headers.ContainsKey(CorrelationIdHeader))
                {
                    context.Response.Headers[CorrelationIdHeader] = correlationId;
                }
                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
