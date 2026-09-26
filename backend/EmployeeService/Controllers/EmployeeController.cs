using EmployeeService.DTOs;
using EmployeeService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        [Authorize]
        [HttpGet("{employeeId}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeById(Guid employeeId)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized();

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized();

                var myEmployee = await _employeeService.GetMyProfileAsync(userId);

                if (myEmployee.EmployeeId != employeeId)
                    return Forbid();

                var employee = await _employeeService.GetEmployeeByIdAsync(employeeId);

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

        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetAllEmployees()
        {
            try
            {
                var employees = await _employeeService.GetAllEmployeesAsync();
                return Ok(employees);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }


        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> SearchEmployees([FromQuery] string searchTerm)
        {
            try
            {
                var employees = await _employeeService.SearchEmployeesAsync(searchTerm);
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

        [Authorize(Roles = "Admin,HR")]
        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>> CreateEmployee(EmployeeCreateDto employeeDto)
        {
            try
            {
                var employee = await _employeeService.CreateEmployeeAsync(employeeDto);
                return CreatedAtAction(nameof(GetEmployeeById), new { employeeId = employee.EmployeeId }, employee);
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

        [Authorize(Roles = "Admin,HR")]
        [HttpPut("{employeeId}")]
        public async Task<ActionResult<EmployeeResponseDto>> UpdateEmployee(Guid employeeId, EmployeeUpdateDto employeeDto)
        {
            try
            {
                var updated = await _employeeService.UpdateEmployeeAsync(employeeId, employeeDto);
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

        [Authorize(Roles = "Admin,HR")]
        [HttpDelete("{employeeId}")]
        public async Task<IActionResult> DeleteEmployee(Guid employeeId)
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

        [HttpGet("me")]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<EmployeeResponseDto>> GetMyProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized();

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Unauthorized();

                var employee = await _employeeService.GetMyProfileAsync(userId);

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
    }
}
