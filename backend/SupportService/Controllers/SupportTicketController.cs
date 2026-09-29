using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SupportService.DTOs;
using SupportService.Services;

namespace SupportService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/support-tickets")]
    public class SupportTicketController : ControllerBase
    {
        private readonly ISupportTicketService _service;
        private readonly EmployeeServiceClient _employeeServiceClient;

        public SupportTicketController(
            ISupportTicketService service,
            EmployeeServiceClient employeeServiceClient)
        {
            _service = service;
            _employeeServiceClient = employeeServiceClient;
        }

        // Create support ticket (All authenticated roles: Employee, HR, Manager, Admin, Support)
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupportTicketCreateDto dto)
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

            var result = await _service.CreateAsync(dto);

            return Ok(result);
        }

        [Authorize]
        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetById(Guid ticketId)
        {
            var result = await _service.GetByIdAsync(ticketId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Support ticket not found."
                });
            }

            var isStaff = User.IsInRole("Support") || User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isStaff)
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

        [Authorize]
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(Guid employeeId)
        {
            var isStaff = User.IsInRole("Support") || User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Manager");
            if (!isStaff)
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
                await _service.GetByEmployeeAsync(employeeId);

            return Ok(result);
        }

        // Get all tickets (Support / Admin / HR / Manager management view)
        [Authorize(Roles = "Support,Admin,HR,Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result =
                await _service.GetAllAsync();

            return Ok(result);
        }

        // Update ticket (Support / Admin / HR / Manager staff management)
        [Authorize(Roles = "Support,Admin,HR,Manager")]
        [HttpPut("{ticketId}")]
        public async Task<IActionResult> Update(
            Guid ticketId,
            [FromBody] SupportTicketUpdateDto dto)
        {
            var ticket = await _service.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                return NotFound(new
                {
                    message = "Support ticket not found."
                });
            }

            var currentEmployee = await _employeeServiceClient.GetMyEmployeeAsync();
            if (currentEmployee == null)
            {
                return Unauthorized(new
                {
                    message = "Unable to identify the logged-in employee."
                });
            }

            var isRequester = ticket.EmployeeId == currentEmployee.EmployeeId;
            var targetStatus = dto.Status?.Trim() ?? "";

            // The requester can NEVER resolve or close their own ticket
            if (isRequester && (targetStatus.Equals("Resolved", StringComparison.OrdinalIgnoreCase) || targetStatus.Equals("Closed", StringComparison.OrdinalIgnoreCase)))
            {
                return StatusCode(403, new { message = "You cannot resolve or close your own support ticket." });
            }

            // Determine assigned role from title
            string assignedRole = "Support";
            if (!string.IsNullOrEmpty(ticket.Title))
            {
                if (ticket.Title.StartsWith("[HR]", StringComparison.OrdinalIgnoreCase)) assignedRole = "HR";
                else if (ticket.Title.StartsWith("[Admin]", StringComparison.OrdinalIgnoreCase)) assignedRole = "Admin";
                else if (ticket.Title.StartsWith("[Manager]", StringComparison.OrdinalIgnoreCase)) assignedRole = "Manager";
                else if (ticket.Title.StartsWith("[Support]", StringComparison.OrdinalIgnoreCase)) assignedRole = "Support";
            }

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value 
                ?? User.FindFirst("role")?.Value 
                ?? "";

            var isAssignedRole = userRole.Equals(assignedRole, StringComparison.OrdinalIgnoreCase);
            var isAdmin = userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);
            var isSupportStaff = userRole.Equals("Support", StringComparison.OrdinalIgnoreCase);

            if (!isAssignedRole && !isAdmin && !isSupportStaff)
            {
                return StatusCode(403, new { message = $"This ticket is assigned to {assignedRole}. Only {assignedRole} team members can manage it." });
            }

            var result =
                await _service.UpdateAsync(ticketId, dto);

            return Ok(result);
        }
    }
}