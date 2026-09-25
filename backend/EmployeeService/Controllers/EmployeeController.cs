using EmployeeService.DTOs;
using EmployeeService.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeService.Controllers
{
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

        [HttpGet("{employeeId}")]
        public async Task<ActionResult<EmployeeResponseDto>> GetEmployeeById(Guid employeeId)
        {
            try
            {
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
    }
}
