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

        public SupportTicketController(
            ISupportTicketService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] SupportTicketCreateDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { ticketId = result.TicketId },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetById(
            Guid ticketId)
        {
            var result =
                await _service.GetByIdAsync(ticketId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Support ticket not found."
                });
            }

            return Ok(result);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(
            Guid employeeId)
        {
            var result =
                await _service.GetByEmployeeAsync(employeeId);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result =
                await _service.GetAllAsync();

            return Ok(result);
        }

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