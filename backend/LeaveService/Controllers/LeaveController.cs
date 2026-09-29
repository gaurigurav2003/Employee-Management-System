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
        private readonly EmployeeServiceClient _employeeServiceClient;

        public LeaveController(
            ILeaveService service,
            EmployeeServiceClient employeeServiceClient)
        {
            _service = service;
            _employeeServiceClient = employeeServiceClient;
        }

        // Apply for own leave (All authenticated employee-linked roles: Employee, HR, Manager, Admin, Support)
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<LeaveResponseDto>> ApplyLeave(LeaveCreateDto dto)
        {
            try
            {
                var employee =
                    await _employeeServiceClient.GetMyEmployeeAsync();

                if (employee == null)
                {
                    return Unauthorized(new
                    {
                        message = "Unable to identify the logged-in employee."
                    });
                }

                if (dto.EmployeeId != employee.EmployeeId)
                {
                    return Forbid();
                }

                var result =
                    await _service.ApplyLeaveAsync(dto);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // Get All Leaves (Admin, HR, Manager queue)
        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetAllLeaves()
        {
            try
            {
                var result = await _service.GetAllLeavesAsync();
                return Ok(result);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [Authorize]
        [HttpGet("{leaveId}")]
        public async Task<ActionResult<LeaveResponseDto>> GetLeaveById(Guid leaveId)
        {
            try
            {
                var result =
                    await _service.GetLeaveByIdAsync(leaveId);

                var isPrivileged = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
                if (!isPrivileged)
                {
                    var employee =
                        await _employeeServiceClient.GetMyEmployeeAsync();

                    if (employee == null)
                    {
                        return Unauthorized(new
                        {
                            message = "Unable to identify the logged-in employee."
                        });
                    }

                    if (result.EmployeeId != employee.EmployeeId)
                    {
                        return Forbid();
                    }
                }

                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new
                {
                    message = "Leave not found."
                });
            }
        }

        [Authorize]
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetLeavesByEmployee(Guid employeeId)
        {
            var isPrivileged = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isPrivileged)
            {
                var employee =
                    await _employeeServiceClient.GetMyEmployeeAsync();

                if (employee == null)
                {
                    return Unauthorized(new
                    {
                        message = "Unable to identify the logged-in employee."
                    });
                }

                if (employeeId != employee.EmployeeId)
                {
                    return Forbid();
                }
            }

            var result =
                await _service.GetLeavesByEmployeeAsync(employeeId);

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{employeeId}/history")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetLeaveHistory(Guid employeeId)
        {
            var isPrivileged = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isPrivileged)
            {
                var employee =
                    await _employeeServiceClient.GetMyEmployeeAsync();

                if (employee == null)
                {
                    return Unauthorized(new
                    {
                        message = "Unable to identify the logged-in employee."
                    });
                }

                if (employeeId != employee.EmployeeId)
                {
                    return Forbid();
                }
            }

            var result =
                await _service.GetLeaveHistoryAsync(employeeId);

            return Ok(result);
        }

        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpPut("{leaveId}/approve")]
        public async Task<ActionResult<LeaveResponseDto>> ApproveLeave(Guid leaveId, [FromBody] Guid approverId)
        {
            try
            {
                var callerEmployee = await _employeeServiceClient.GetMyEmployeeAsync();
                var effectiveApproverId = approverId != Guid.Empty
                    ? approverId
                    : (callerEmployee?.EmployeeId ?? Guid.Empty);

                var leave = await _service.GetLeaveByIdAsync(leaveId);
                if (callerEmployee != null && leave.EmployeeId == callerEmployee.EmployeeId)
                {
                    return StatusCode(403, new { message = "You cannot approve your own leave." });
                }

                var updated = await _service.ApproveLeaveAsync(leaveId, effectiveApproverId);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(403, new { error = ex.Message });
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
        
        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpPut("{leaveId}/reject")]
        public async Task<ActionResult<LeaveResponseDto>> RejectLeave(Guid leaveId, [FromBody] Guid approverId)
        {
            try
            {
                var callerEmployee = await _employeeServiceClient.GetMyEmployeeAsync();
                var effectiveApproverId = approverId != Guid.Empty
                    ? approverId
                    : (callerEmployee?.EmployeeId ?? Guid.Empty);

                var leave = await _service.GetLeaveByIdAsync(leaveId);
                if (callerEmployee != null && leave.EmployeeId == callerEmployee.EmployeeId)
                {
                    return StatusCode(403, new { message = "You cannot reject/modify your own leave." });
                }

                var updated = await _service.RejectLeaveAsync(leaveId, effectiveApproverId);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(403, new { error = ex.Message });
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