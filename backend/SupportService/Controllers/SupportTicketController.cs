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
        [Authorize(Roles = "Employee")]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] SupportTicketCreateDto dto)
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

            if (User.IsInRole("Employee"))
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
            if (User.IsInRole("Employee"))
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

        [Authorize(Roles = "Support,Admin,HR")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result =
                await _service.GetAllAsync();

            return Ok(result);
        }

        [Authorize(Roles = "Support,Admin,HR")]
        [HttpPut("{ticketId}")]
        public async Task<IActionResult> Update(
            Guid ticketId,
            [FromBody] SupportTicketUpdateDto dto)
        {
            var result =
                await _service.UpdateAsync(ticketId, dto);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Support ticket not found."
                });
            }

            return Ok(result);
        }
    }
}