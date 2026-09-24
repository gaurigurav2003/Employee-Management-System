using EmployeeService.Models;

namespace EmployeeService.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        public Task<Employee> AddAsync(Employee employee)
        {
            throw new NotImplementedException();
        }

        public Task<Employee?> GetByIdAsync(Guid employeeId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Employee>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Employee>> SearchAsync(string searchTerm)
        {
            throw new NotImplementedException();
        }

        public Task<Employee> UpdateAsync(Employee employee)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Employee employee)
        {
            throw new NotImplementedException();
        }
    }
}