using DepartmentService.DTOs;
using DepartmentService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace DepartmentService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/departments")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentController(IDepartmentService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpPost]
        public async Task<ActionResult<DepartmentResponseDto>> CreateDepartment(DepartmentCreateDto dto)
        {
            try
            {
                var created = await _service.CreateDepartmentAsync(dto);
                return CreatedAtAction(nameof(GetDepartmentById), new { departmentId = created.DepartmentId }, created);
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


        [HttpGet("{departmentId}")]
        public async Task<ActionResult<DepartmentResponseDto>> GetDepartmentById(Guid departmentId)
        {
            try
            {
                var dept = await _service.GetDepartmentByIdAsync(departmentId);
                return Ok(dept);
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentResponseDto>>> GetAllDepartments()
        {
            try
            {
                var depts = await _service.GetAllDepartmentsAsync();
                return Ok(depts);
            }
            catch (Exception)
            {
                return Problem("An unexpected error occurred.");
            }
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpPut("{departmentId}")]
        public async Task<ActionResult<DepartmentResponseDto>> UpdateDepartment(Guid departmentId, DepartmentUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateDepartmentAsync(departmentId, dto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
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

        [Authorize(Roles = "Admin,HR")]
        [HttpDelete("{departmentId}")]
        public async Task<IActionResult> DeleteDepartment(Guid departmentId)
        {
            try
            {
                await _service.DeleteDepartmentAsync(departmentId);
                return NoContent();
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