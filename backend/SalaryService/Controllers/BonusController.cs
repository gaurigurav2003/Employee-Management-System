using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/salaries/{employeeId}/bonuses")]
    public class BonusController : ControllerBase
    {
        private readonly ISalaryService _service;

        public BonusController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<BonusResponseDto>> AddBonus(Guid employeeId, BonusCreateDto dto)
        {
            try
            {
                dto.EmployeeId = employeeId;
                var created = await _service.AddBonusAsync(dto);
                return CreatedAtAction(nameof(GetBonuses), new { employeeId }, created);
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
        public async Task<ActionResult<IEnumerable<BonusResponseDto>>> GetBonuses(Guid employeeId)
        {
            try
            {
                var list = await _service.GetBonusesAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }
    }
}
