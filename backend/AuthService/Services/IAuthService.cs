using AuthService.DTOs;

using AuthService.DTOs;

namespace AuthService.Services
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterRequestDto request);

        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

        Task ForgotPasswordAsync(ForgotPasswordRequestDto request);

        Task ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
