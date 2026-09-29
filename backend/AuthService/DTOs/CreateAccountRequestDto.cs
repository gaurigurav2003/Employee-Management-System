namespace AuthService.DTOs
{
    /// <summary>
    /// Request DTO for secure internal account creation.
    /// Creator role is taken from the JWT – not from this payload.
    /// </summary>
    public class CreateAccountRequestDto
    {
        /// <summary>Email for the new account.</summary>
        public string Email { get; set; }

        /// <summary>Desired role for the new account (Employee / HR / Manager / Support).</summary>
        public string Role { get; set; }
    }
}
