using DepartmentService.DTOs;
using DepartmentService.Models;
using DepartmentService.Repositories;

namespace DepartmentService.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repository;

        public DepartmentService(IDepartmentRepository repository)
        {
            _repository = repository;
        }

        public async Task<DepartmentResponseDto> CreateDepartmentAsync(DepartmentCreateDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Department data is required.");

            if (string.IsNullOrWhiteSpace(dto.DepartmentName) || string.IsNullOrWhiteSpace(dto.Description))
                throw new ArgumentException("DepartmentName and Description are required.");

            var department = new Department
            {
                DepartmentId = Guid.NewGuid(),
                DepartmentName = dto.DepartmentName,
                Description = dto.Description
                // CreatedAt/UpdatedAt handled by DbContext
            };

            var created = await _repository.AddAsync(department);
            return MapToDto(created);
        }

        public async Task<DepartmentResponseDto> GetDepartmentByIdAsync(Guid departmentId)
        {
            var dept = await _repository.GetByIdAsync(departmentId);
            if (dept == null)
                throw new KeyNotFoundException("Department not found.");

            return MapToDto(dept);
        }

        public async Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync()
        {
            var depts = await _repository.GetAllAsync();
            return depts.Select(MapToDto);
        }

        public async Task<DepartmentResponseDto> UpdateDepartmentAsync(Guid departmentId, DepartmentUpdateDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Department data is required.");

            var existing = await _repository.GetByIdAsync(departmentId);
            if (existing == null)
                throw new KeyNotFoundException("Department not found.");

            existing.DepartmentName = dto.DepartmentName;
            existing.Description = dto.Description;

            var updated = await _repository.UpdateAsync(existing);
            return MapToDto(updated);
        }

        public async Task DeleteDepartmentAsync(Guid departmentId)
        {
            var existing = await _repository.GetByIdAsync(departmentId);
            if (existing == null)
                throw new KeyNotFoundException("Department not found.");

            // Business rule: cannot enforce employees assigned without cross-service integration
            await _repository.DeleteAsync(existing);
        }

        private static DepartmentResponseDto MapToDto(Department d) => new DepartmentResponseDto
        {
            DepartmentId = d.DepartmentId,
            DepartmentName = d.DepartmentName,
            Description = d.Description,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };
    }
}
