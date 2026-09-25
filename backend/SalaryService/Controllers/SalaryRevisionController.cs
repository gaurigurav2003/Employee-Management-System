using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/salaries/{employeeId}/revisions")]
    public class SalaryRevisionController : ControllerBase
    {
        private readonly ISalaryService _service;

        public SalaryRevisionController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<SalaryRevisionResponseDto>> AddRevision(Guid employeeId, SalaryRevisionCreateDto dto)
        {
            try
            {
                dto.EmployeeId = employeeId;
                var created = await _service.AddSalaryRevisionAsync(dto);
                return CreatedAtAction(nameof(GetRevisions), new { employeeId }, created);
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
        public async Task<ActionResult<IEnumerable<SalaryRevisionResponseDto>>> GetRevisions(Guid employeeId)
        {
            try
            {
                var list = await _service.GetSalaryRevisionsAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }
    }
}
