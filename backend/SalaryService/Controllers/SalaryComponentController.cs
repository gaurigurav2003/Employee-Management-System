using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/salaries/{employeeId}/components")]
    public class SalaryComponentController : ControllerBase
    {
        private readonly ISalaryService _service;

        public SalaryComponentController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<SalaryComponentResponseDto>> AddComponent(Guid employeeId, SalaryComponentCreateDto dto)
        {
            try
            {
                dto.EmployeeId = employeeId;
                var created = await _service.AddSalaryComponentAsync(dto);
                return CreatedAtAction(nameof(GetComponents), new { employeeId }, created);
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalaryComponentResponseDto>>> GetComponents(Guid employeeId)
        {
            try
            {
                var list = await _service.GetSalaryComponentsAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }
    }
}
