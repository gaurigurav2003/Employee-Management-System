using System.Net.Http.Headers;
using System.Text.Json;
using SupportService.DTOs;

namespace SupportService.Services
{
    public class EmployeeServiceClient
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EmployeeServiceClient(
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<EmployeeIdentityDto?> GetMyEmployeeAsync()
        {
            var client =
                _httpClientFactory.CreateClient("EmployeeService");

            var token =
                _httpContextAccessor.HttpContext?
                    .Request.Headers.Authorization
                    .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
            }

            client.DefaultRequestHeaders.Authorization =
                AuthenticationHeaderValue.Parse(token);

            var response =
                await client.GetAsync("/api/v1/employees/me");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var json =
                await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<EmployeeIdentityDto>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
        }
    }
}