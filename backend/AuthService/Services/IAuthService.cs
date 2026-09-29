using AuthService.DTOs;

namespace AuthService.Services
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterRequestDto request);

        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

        Task ForgotPasswordAsync(ForgotPasswordRequestDto request);

        Task ResetPasswordAsync(ResetPasswordRequestDto request);

        /// <summary>
        /// Creates a new internal account (pending activation).
        /// The creatorRole must be validated by the caller from the authenticated JWT.
        /// </summary>
        Task<CreateAccountResponseDto> CreateAccountAsync(CreateAccountRequestDto request, string creatorRole);

        /// <summary>
        /// Activates an account by validating the token and setting the password.
        /// </summary>
        Task ActivateAccountAsync(ActivateAccountRequestDto request);
    }
}
