using AuthService.DTOs;
using AuthService.Models;
using AuthService.Repositories;
using AuthService.Security;

namespace AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthService(IUserRepository userRepository, PasswordHasher passwordHasher, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task RegisterAsync(RegisterRequestDto request)
        {
            if (request == null)
                throw new ArgumentException("Invalid request");

            if (string.IsNullOrWhiteSpace(request.Username))
                throw new ArgumentException("Username is required.");

            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required.");

            var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (!emailAttr.IsValid(request.Email))
                throw new ArgumentException("Email is not a valid email address.");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required.");

            if (request.Password != request.ConfirmPassword)
                throw new ArgumentException("Password and ConfirmPassword do not match.");

            var existingByUsername = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingByUsername != null)
                throw new InvalidOperationException("Username is already taken.");

            var existingByEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingByEmail != null)
                throw new InvalidOperationException("Email is already registered.");

            var now = DateTime.UtcNow;

            var user = new User
            {
                UserId = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role,
                CreatedAt = now,
                UpdatedAt = now,
                IsActive = true
            };

            await _userRepository.CreateAsync(user);
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            if (request == null)
                throw new ArgumentException("Invalid request");

            if (string.IsNullOrWhiteSpace(request.Username))
                throw new ArgumentException("Username is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required.");

            var user = await _userRepository.GetByUsernameAsync(request.Username);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid username or password.");

            var valid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
            if (!valid)
                throw new UnauthorizedAccessException("Invalid username or password.");

            if (!user.IsActive)
                throw new InvalidOperationException("User is inactive.");

            var (token, expires) = _jwtService.GenerateToken(user.UserId, user.Username, user.Role);

            var response = new LoginResponseDto
            {
                AccessToken = token,
                UserId = user.UserId,
                Username = user.Username,
                Role = user.Role,
                ExpiresAt = expires
            };

            return response;
        }

        public Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            throw new NotImplementedException();
        }
    }
}
