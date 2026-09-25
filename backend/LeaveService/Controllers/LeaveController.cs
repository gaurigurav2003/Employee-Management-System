using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LeaveService.DTOs;
using LeaveService.Services;

namespace LeaveService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/leaves")]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _service;

        public LeaveController(ILeaveService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<LeaveResponseDto>> ApplyLeave(LeaveCreateDto dto)
        {
            try
            {
                var created = await _service.ApplyLeaveAsync(dto);
                return CreatedAtAction(nameof(GetLeaveById), new { leaveId = created.LeaveId }, created);
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

        [HttpGet("{leaveId}")]
        public async Task<ActionResult<LeaveResponseDto>> GetLeaveById(Guid leaveId)
        {
            try
            {
                var l = await _service.GetLeaveByIdAsync(leaveId);
                return Ok(l);
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

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetLeavesByEmployee(Guid employeeId)
        {
            try
            {
                var list = await _service.GetLeavesByEmployeeAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [HttpGet("{employeeId}/history")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetLeaveHistory(Guid employeeId)
        {
            try
            {
                var list = await _service.GetLeaveHistoryAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [HttpPut("{leaveId}/approve")]
        public async Task<ActionResult<LeaveResponseDto>> ApproveLeave(Guid leaveId, [FromBody] Guid approverId)
        {
            try
            {
                var updated = await _service.ApproveLeaveAsync(leaveId, approverId);
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

        [HttpPut("{leaveId}/reject")]
        public async Task<ActionResult<LeaveResponseDto>> RejectLeave(Guid leaveId, [FromBody] Guid approverId)
        {
            try
            {
                var updated = await _service.RejectLeaveAsync(leaveId, approverId);
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