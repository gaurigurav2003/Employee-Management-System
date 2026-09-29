using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs
{
    /// <summary>Request DTO for the account activation (set-password) step.</summary>
    public class ActivateAccountRequestDto
    {
        [Required]
        public string Token { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string ConfirmPassword { get; set; }
    }
}
