using System;

namespace AuthService.Security
{
    public interface IJwtService
    {
        /// <summary>
        /// Generate a JWT access token for the specified user information.
        /// Returns a tuple of token string and expiration UTC time.
        /// </summary>
        (string Token, DateTime ExpiresAt) GenerateToken(Guid userId, string username, string role);
    }
}
