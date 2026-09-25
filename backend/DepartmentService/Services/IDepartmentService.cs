using DepartmentService.DTOs;

namespace DepartmentService.Services
{
    public interface IDepartmentService
    {
        Task<DepartmentResponseDto> CreateDepartmentAsync(DepartmentCreateDto dto);

        Task<DepartmentResponseDto> GetDepartmentByIdAsync(Guid departmentId);

        Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync();

        Task<DepartmentResponseDto> UpdateDepartmentAsync(Guid departmentId, DepartmentUpdateDto dto);

        Task DeleteDepartmentAsync(Guid departmentId);
    }
}
