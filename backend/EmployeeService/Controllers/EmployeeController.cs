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

        // GET: api/v1/employees/{employeeId}
        [Authorize]
        [HttpGet("{employeeId}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeById(
            Guid employeeId)
        {
            try
            {
                var userIdClaim =
                    User.FindFirst("userId")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized();

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized();

                var myEmployee =
                    await _employeeService.GetMyProfileAsync(userId);

                if (myEmployee.EmployeeId != employeeId)
                    return Forbid();

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
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>>
            GetAllEmployees()
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
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>>
            SearchEmployees([FromQuery] string searchTerm)
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

        // GET: api/v1/employees/me
        // Used by Employee, HR, Manager and Admin to get their own employee profile
        [Authorize(Roles = "Employee,HR,Manager,Admin")]
        [HttpGet("me")]
        public async Task<ActionResult<EmployeeResponseDto>>
            GetMyProfile()
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

                var employee =
                    await _employeeService.GetMyProfileAsync(userId);

                return Ok(employee);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new
                {
                    message = "Employee profile not found."
                });
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        // POST: api/v1/employees
        [Authorize(Roles = "Admin,HR")]
        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>>
            CreateEmployee(EmployeeCreateDto employeeDto)
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

        // PUT: api/v1/employees/{employeeId}
        [Authorize(Roles = "Admin,HR")]
        [HttpPut("{employeeId}")]
        public async Task<ActionResult<EmployeeResponseDto>>
            UpdateEmployee(
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

        // DELETE: api/v1/employees/{employeeId}
        [Authorize(Roles = "Admin,HR")]
        [HttpDelete("{employeeId}")]
        public async Task<IActionResult>
            DeleteEmployee(Guid employeeId)
        {
            try
            {
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