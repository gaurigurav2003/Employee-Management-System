using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;
using Microsoft.AspNetCore.Authorization;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/overtime")]
    public class OvertimeController : ControllerBase
    {
        private readonly ISalaryService _service;

        public OvertimeController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<OvertimeResponseDto>> SubmitOvertime(OvertimeCreateDto dto)
        {
            try
            {
                var created = await _service.AddOvertimeAsync(dto);
                return CreatedAtAction(nameof(GetOvertimeForEmployee), new { employeeId = created.EmployeeId }, created);
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
        public async Task<ActionResult<IEnumerable<OvertimeResponseDto>>> GetOvertimeForEmployee(Guid employeeId)
        {
            try
            {
                var list = await _service.GetOvertimeAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [Authorize]
        [HttpPut("{overtimeId}/approve")]
        public async Task<ActionResult<OvertimeResponseDto>> ApproveOvertime(Guid overtimeId)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                if (!Guid.TryParse(userId, out var approverId))
                    return Unauthorized();

                var updated = await _service.ApproveOvertimeAsync(
                    overtimeId,
                    approverId);

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

        [Authorize]
        [HttpPut("{overtimeId}/reject")]
        public async Task<ActionResult<OvertimeResponseDto>> RejectOvertime(Guid overtimeId)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                if (!Guid.TryParse(userId, out var approverId))
                    return Unauthorized();

                var updated = await _service.RejectOvertimeAsync(
                    overtimeId,
                    approverId);

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

