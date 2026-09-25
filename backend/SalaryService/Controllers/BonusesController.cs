using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/bonuses")]
    public class BonusesController : ControllerBase
    {
        private readonly ISalaryService _service;

        public BonusesController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPut("{bonusId}")]
        public async Task<ActionResult<BonusResponseDto>> UpdateBonus(Guid bonusId, BonusUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateBonusAsync(bonusId, dto);
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
