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
        private readonly EmployeeServiceClient _employeeServiceClient;

        public AttendanceController(
            IAttendanceService service,
            EmployeeServiceClient employeeServiceClient)
        {
            _service = service;
            _employeeServiceClient = employeeServiceClient;
        }

        // Check In (Self-service for any employee-linked role: Employee, HR, Manager, Admin, Support)
        [Authorize]
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] AttendanceCreateDto dto)
        {
            try
            {
                var employee = await _employeeServiceClient.GetMyEmployeeAsync();

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

        // Get Attendance record by attendanceId
        [Authorize]
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

            var isPrivileged = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isPrivileged)
            {
                var employee = await _employeeServiceClient.GetMyEmployeeAsync();

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

        // Get Employee Attendance History
        [Authorize]
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(Guid employeeId)
        {
            var isPrivileged = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isPrivileged)
            {
                var employee = await _employeeServiceClient.GetMyEmployeeAsync();

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

            var result = await _service.GetByEmployeeAsync(employeeId);

            return Ok(result);
        }

        // Get All Attendance (Management queue for Admin / HR / Manager)
        [Authorize(Roles = "Admin,HR,Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(result);
        }

        // Check Out (Self-service for any employee-linked role)
        [Authorize]
        [HttpPut("{attendanceId}/check-out")]
        public async Task<IActionResult> CheckOut(
            Guid attendanceId,
            [FromBody] AttendanceUpdateDto dto)
        {
            var attendance = await _service.GetByIdAsync(attendanceId);

            if (attendance == null)
            {
                return NotFound(new
                {
                    message = "Attendance record not found."
                });
            }

            var employee = await _employeeServiceClient.GetMyEmployeeAsync();

            if (employee == null)
            {
                return Unauthorized(new
                {
                    message = "Unable to identify the logged-in employee."
                });
            }

            if (attendance.EmployeeId != employee.EmployeeId)
            {
                return Forbid();
            }

            var result = await _service.CheckOutAsync(
                attendanceId,
                dto);

            return Ok(result);
        }
    }
}