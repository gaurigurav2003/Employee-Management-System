using EmployeeService.Models;

namespace EmployeeService.Repositories
{
    public interface IEmployeeRepository
    {
        Task<Employee> AddAsync(Employee employee);

        Task<Employee?> GetByIdAsync(Guid employeeId);

        Task<IEnumerable<Employee>> GetAllAsync();

        Task<IEnumerable<Employee>> SearchAsync(string searchTerm);

        Task<Employee> UpdateAsync(Employee employee);

        Task DeleteAsync(Employee employee);
    }
}