using System;

namespace AuthService.DTOs
{
    public class LoginResponseDto
    {
        public string AccessToken { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
