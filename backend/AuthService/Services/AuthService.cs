using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
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

        // Allowed roles a creator role can create
        private static readonly Dictionary<string, HashSet<string>> AllowedCreations = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Admin"]   = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "HR", "Manager" },
            ["HR"]      = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Employee", "Support" },
            ["Manager"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Employee" },
        };

        public AuthService(IUserRepository userRepository, PasswordHasher passwordHasher, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        // ─── Register (legacy public endpoint) ──────────────────────────────────
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
                Role = string.IsNullOrWhiteSpace(request.Role) ? "Employee" : request.Role,
                CreatedAt = now,
                UpdatedAt = now,
                IsActive = true
            };

            await _userRepository.CreateAsync(user);
        }

        // ─── Login ───────────────────────────────────────────────────────────────
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            if (request == null)
                throw new ArgumentException("Invalid request");

            if (string.IsNullOrWhiteSpace(request.Username))
                throw new ArgumentException("Username is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required.");

            // Allow login by email or username
            var user = await _userRepository.GetByUsernameAsync(request.Username)
                    ?? await _userRepository.GetByEmailAsync(request.Username);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid username or password.");

            var valid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
            if (!valid)
                throw new UnauthorizedAccessException("Invalid username or password.");

            if (!user.IsActive)
                throw new InvalidOperationException("Account is not yet activated. Please use the activation link sent to your email.");

            var (token, expires) = _jwtService.GenerateToken(user.UserId, user.Username, user.Role, user.Email);

            return new LoginResponseDto
            {
                AccessToken = token,
                UserId = user.UserId,
                Username = user.Username,
                Role = user.Role,
                ExpiresAt = expires
            };
        }

        // ─── CreateAccount (secure internal) ────────────────────────────────────
        public async Task<CreateAccountResponseDto> CreateAccountAsync(CreateAccountRequestDto request, string creatorRole)
        {
            if (request == null)
                throw new ArgumentException("Invalid request.");

            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required.");

            if (string.IsNullOrWhiteSpace(request.Role))
                throw new ArgumentException("Role is required.");

            var emailAttr = new System.ComponentModel.DataAnnotations.EmailAddressAttribute();
            if (!emailAttr.IsValid(request.Email))
                throw new ArgumentException("Email is not a valid email address.");

            // Enforce creator-role permission
            if (!AllowedCreations.TryGetValue(creatorRole, out var allowedRoles) || !allowedRoles.Contains(request.Role))
                throw new UnauthorizedAccessException($"Role '{creatorRole}' is not allowed to create accounts with role '{request.Role}'.");

            // Check email uniqueness
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
                throw new InvalidOperationException($"An account with email '{request.Email}' already exists.");

            // Generate unique username from email local part
            var baseUsername = request.Email.Split('@')[0].ToLowerInvariant()
                .Replace(".", "_").Replace("+", "_");
            var username = await GenerateUniqueUsernameAsync(baseUsername);

            // Generate cryptographically secure activation token
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');  // URL-safe

            var tokenHash = ComputeSha256(rawToken);
            var tokenExpiry = DateTime.UtcNow.AddHours(24);

            var now = DateTime.UtcNow;
            var user = new User
            {
                UserId = Guid.NewGuid(),
                Username = username,
                Email = request.Email.ToLowerInvariant(),
                PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString()), // temporary random
                Role = request.Role,
                IsActive = false,
                ActivationTokenHash = tokenHash,
                ActivationTokenExpiresAt = tokenExpiry,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _userRepository.CreateAsync(user);

            return new CreateAccountResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                ActivationToken = rawToken,
                ActivationTokenExpiresAt = tokenExpiry
            };
        }

        // ─── ActivateAccount ─────────────────────────────────────────────────────
        public async Task ActivateAccountAsync(ActivateAccountRequestDto request)
        {
            if (request == null)
                throw new ArgumentException("Invalid request.");

            if (string.IsNullOrWhiteSpace(request.Token))
                throw new ArgumentException("Activation token is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required.");

            if (request.Password != request.ConfirmPassword)
                throw new ArgumentException("Password and ConfirmPassword do not match.");

            ValidatePasswordStrength(request.Password);

            var tokenHash = ComputeSha256(request.Token);
            var user = await _userRepository.GetByActivationTokenHashAsync(tokenHash);

            if (user == null)
                throw new KeyNotFoundException("Activation token is invalid or has already been used.");

            if (user.ActivationTokenExpiresAt == null || user.ActivationTokenExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("Activation token has expired. Please request a new activation link.");

            if (user.IsActive)
                throw new InvalidOperationException("Account is already active.");

            user.PasswordHash = _passwordHasher.HashPassword(request.Password);
            user.IsActive = true;
            user.ActivationTokenHash = null;
            user.ActivationTokenExpiresAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);
        }

        // ─── Legacy stubs ────────────────────────────────────────────────────────
        public Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            throw new NotImplementedException();
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────
        private async Task<string> GenerateUniqueUsernameAsync(string baseUsername)
        {
            var candidate = baseUsername;
            var counter = 1;
            while (await _userRepository.GetByUsernameAsync(candidate) != null)
            {
                candidate = $"{baseUsername}{counter++}";
            }
            return candidate;
        }

        private static string ComputeSha256(string input)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static void ValidatePasswordStrength(string password)
        {
            if (password.Length < 8)
                throw new ArgumentException("Password must be at least 8 characters long.");

            if (!Regex.IsMatch(password, @"[A-Z]"))
                throw new ArgumentException("Password must contain at least one uppercase letter.");

            if (!Regex.IsMatch(password, @"[a-z]"))
                throw new ArgumentException("Password must contain at least one lowercase letter.");

            if (!Regex.IsMatch(password, @"[0-9]"))
                throw new ArgumentException("Password must contain at least one number.");

            if (!Regex.IsMatch(password, @"[^A-Za-z0-9]"))
                throw new ArgumentException("Password must contain at least one special character.");
        }
    }
}
