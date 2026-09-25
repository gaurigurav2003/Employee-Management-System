using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/payslips")]
    public class PayslipController : ControllerBase
    {
        private readonly ISalaryService _service;

        public PayslipController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost("{payrollId}/{employeeId}")]
        public async Task<ActionResult<PayslipResponseDto>> GeneratePayslip(Guid payrollId, Guid employeeId)
        {
            try
            {
                var created = await _service.GeneratePayslipAsync(payrollId, employeeId);
                return CreatedAtAction(nameof(GetPayslipById), new { payslipId = created.PayslipId }, created);
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
        public async Task<ActionResult<IEnumerable<PayslipResponseDto>>> GetPayslipsForEmployee([FromQuery] Guid employeeId)
        {
            try
            {
                if (employeeId == Guid.Empty)
                    return BadRequest(new { error = "employeeId query parameter is required." });

                var list = await _service.GetPayslipsForEmployeeAsync(employeeId);
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [HttpGet("{payslipId}")]
        public async Task<ActionResult<PayslipResponseDto>> GetPayslipById(Guid payslipId)
        {
            try
            {
                var p = await _service.GetPayslipByIdAsync(payslipId);
                return Ok(p);
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
    }
}
