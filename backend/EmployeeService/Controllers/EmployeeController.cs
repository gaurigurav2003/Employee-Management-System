using EmployeeService.DTOs;
using EmployeeService.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeService.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
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
            var employee = await _employeeService.GetEmployeeByIdAsync(employeeId);

            return Ok(employee);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetAllEmployees()
        {
            var employees = await _employeeService.GetAllEmployeesAsync();

            return Ok(employees);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> SearchEmployees(
    [FromQuery] string searchTerm)
        {
            var employees = await _employeeService.SearchEmployeesAsync(searchTerm);

            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeResponseDto>> CreateEmployee(
    EmployeeCreateDto employeeDto)
        {
            var employee = await _employeeService.CreateEmployeeAsync(employeeDto);

            return Ok(employee);
        }
    }
}