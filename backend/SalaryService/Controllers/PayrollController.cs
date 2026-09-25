using Microsoft.AspNetCore.Mvc;
using SalaryService.DTOs;
using SalaryService.Services;

namespace SalaryService.Controllers
{
    [ApiController]
    [Route("api/v1/payroll")]
    public class PayrollController : ControllerBase
    {
        private readonly ISalaryService _service;

        public PayrollController(ISalaryService service)
        {
            _service = service;
        }

        public class GeneratePayrollRequest { public int Month { get; set; } public int Year { get; set; } }

        [HttpPost]
        public async Task<ActionResult<PayrollResponseDto>> GeneratePayroll(GeneratePayrollRequest req)
        {
            try
            {
                var created = await _service.GeneratePayrollAsync(req.Month, req.Year);
                return CreatedAtAction(nameof(GetPayrollById), new { payrollId = created.PayrollId }, created);
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
        public async Task<ActionResult<IEnumerable<PayrollResponseDto>>> GetPayrolls()
        {
            try
            {
                var list = await _service.GetPayrollsAsync();
                return Ok(list);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [HttpGet("{payrollId}")]
        public async Task<ActionResult<PayrollResponseDto>> GetPayrollById(Guid payrollId)
        {
            try
            {
                var p = await _service.GetPayrollByIdAsync(payrollId);
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

        [HttpGet("{payrollId}/items")]
        public async Task<ActionResult<IEnumerable<PayrollItemResponseDto>>> GetPayrollItems(Guid payrollId)
        {
            try
            {
                var items = await _service.GetPayrollItemsAsync(payrollId);
                return Ok(items);
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
