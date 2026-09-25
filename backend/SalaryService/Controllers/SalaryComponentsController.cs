using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/salary-components")]
    public class SalaryComponentsController : ControllerBase
    {
        private readonly ISalaryService _service;

        public SalaryComponentsController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPut("{salaryComponentId}")]
        public async Task<ActionResult<SalaryComponentResponseDto>> UpdateComponent(Guid salaryComponentId, SalaryComponentUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateSalaryComponentAsync(salaryComponentId, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
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
    }
}
