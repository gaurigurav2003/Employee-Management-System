namespace AuthService.DTOs
{
    /// <summary>
    /// Response returned after a successful internal account creation.
    /// Contains the activation token in plain-text (for dev display / email) – never stored plain in DB.
    /// </summary>
    public class CreateAccountResponseDto
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        /// <summary>Plain-text activation token to be sent to the employee (via email or dev link).</summary>
        public string ActivationToken { get; set; }
        public DateTime ActivationTokenExpiresAt { get; set; }
    }
}
