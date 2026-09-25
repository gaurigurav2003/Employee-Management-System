using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/salaries")]
    public class SalaryController : ControllerBase
    {
        private readonly ISalaryService _service;

        public SalaryController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeSalaryResponseDto>> CreateSalary(EmployeeSalaryCreateDto dto)
        {
            try
            {
                var created = await _service.CreateEmployeeSalaryAsync(dto);
                return CreatedAtAction(nameof(GetSalary), new { employeeId = created.EmployeeId }, created);
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

        [HttpGet("{employeeId}")]
        public async Task<ActionResult<EmployeeSalaryResponseDto>> GetSalary(Guid employeeId)
        {
            try
            {
                var s = await _service.GetEmployeeSalaryByEmployeeIdAsync(employeeId);
                return Ok(s);
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

        [HttpPut("{employeeId}")]
        public async Task<ActionResult<EmployeeSalaryResponseDto>> UpdateSalary(Guid employeeId, EmployeeSalaryUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateEmployeeSalaryAsync(employeeId, dto);
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
    }
}
