using DepartmentService.Models;

namespace DepartmentService.Repositories
{
    public interface IDepartmentRepository
    {
        Task<Department> AddAsync(Department department);

        Task<Department?> GetByIdAsync(Guid departmentId);

        Task<IEnumerable<Department>> GetAllAsync();

        Task<Department> UpdateAsync(Department department);

        Task DeleteAsync(Department department);
    }
}
