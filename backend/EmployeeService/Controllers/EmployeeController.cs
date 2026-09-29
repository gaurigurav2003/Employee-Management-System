using EmployeeService.DTOs;
using EmployeeService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/employees")]
    [Produces("application/json")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        // GET: api/v1/employees/me
        // Used by Employee, HR, Manager, Admin, Support to get their own employee profile
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<EmployeeResponseDto>> GetMyProfile()
        {
            try
            {
                var userIdClaim =
                    User.FindFirst("userId")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new
                    {
                        message = "User ID not found in token."
                    });
                }

                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        message = "Invalid user ID."
                    });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("unique_name")?.Value ?? "User";
                var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value ?? "Employee";

                var employee =
                    await _employeeService.GetOrCreateProfileAsync(userId, username, email, role);

                return Ok(employee);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // GET: api/v1/employees/by-user/{userId:guid}
        [Authorize]
        [HttpGet("by-user/{userId:guid}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeByUserId(Guid userId)
        {
            try
            {
                var employee = await _employeeService.GetMyProfileAsync(userId);
                return Ok(employee);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Employee profile not found." });
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // GET: api/v1/employees/{employeeId:guid}
        [Authorize]
        [HttpGet("{employeeId:guid}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeById(Guid employeeId)
        {
            try
            {
                var employee =
                    await _employeeService.GetEmployeeByIdAsync(employeeId);

                return Ok(employee);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // GET: api/v1/employees
        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetAllEmployees()
        {
            try
            {
                var employees =
                    await _employeeService.GetAllEmployeesAsync();

                return Ok(employees);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // GET: api/v1/employees/search?searchTerm=...
        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> SearchEmployees([FromQuery] string searchTerm)
        {
            try
            {
                var employees =
                    await _employeeService.SearchEmployeesAsync(searchTerm);

                return Ok(employees);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // POST: api/v1/employees
        [Authorize(Roles = "Admin,HR")]
        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>> CreateEmployee(EmployeeCreateDto employeeDto)
        {
            try
            {
                var employee =
                    await _employeeService.CreateEmployeeAsync(employeeDto);

                return CreatedAtAction(
                    nameof(GetEmployeeById),
                    new { employeeId = employee.EmployeeId },
                    employee
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // PUT: api/v1/employees/{employeeId:guid}
        [Authorize(Roles = "Admin,HR")]
        [HttpPut("{employeeId:guid}")]
        public async Task<ActionResult<EmployeeResponseDto>> UpdateEmployee(
            Guid employeeId,
            EmployeeUpdateDto employeeDto)
        {
            try
            {
                var updated =
                    await _employeeService.UpdateEmployeeAsync(
                        employeeId,
                        employeeDto
                    );

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // DELETE: api/v1/employees/{employeeId:guid}
        [Authorize(Roles = "Admin,HR")]
        [HttpDelete("{employeeId:guid}")]
        public async Task<IActionResult> DeleteEmployee(Guid employeeId)
        {
            try
            {
                var userIdClaim =
                    User.FindFirst("userId")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;

                if (Guid.TryParse(userIdClaim, out var currentUserId))
                {
                    try
                    {
                        var myProfile = await _employeeService.GetMyProfileAsync(currentUserId);
                        if (myProfile != null && myProfile.EmployeeId == employeeId)
                        {
                            return StatusCode(403, new { message = "You cannot delete your own employee record." });
                        }
                    }
                    catch (KeyNotFoundException)
                    {
                        // Caller has no employee profile, proceed
                    }
                }

                await _employeeService.DeleteEmployeeAsync(employeeId);

                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }
    }
}