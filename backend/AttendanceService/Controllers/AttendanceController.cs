using AttendanceService.DTOs;
using AttendanceService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AttendanceService.Controllers
{
	[Authorize]
    [ApiController]
    [Route("api/v1/attendance")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendanceController(IAttendanceService service)
        {
            _service = service;
        }

        // Check In
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn(
            [FromBody] AttendanceCreateDto dto)
        {
            try
            {
                var result = await _service.CheckInAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { attendanceId = result.AttendanceId },
                    result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // Get Attendance By ID
        [HttpGet("{attendanceId}")]
        public async Task<IActionResult> GetById(Guid attendanceId)
        {
            var result = await _service.GetByIdAsync(attendanceId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Attendance record not found."
                });
            }

            return Ok(result);
        }

        // Get Employee Attendance History
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(Guid employeeId)
        {
            var result = await _service.GetByEmployeeAsync(employeeId);

            return Ok(result);
        }

        // Get All Attendance
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(result);
        }

        // Check Out
        [HttpPut("{attendanceId}/check-out")]
        public async Task<IActionResult> CheckOut(
            Guid attendanceId,
            [FromBody] AttendanceUpdateDto dto)
        {
            var result = await _service.CheckOutAsync(
                attendanceId,
                dto);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Attendance record not found."
                });
            }

            return Ok(result);
        }
    }
}