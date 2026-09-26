using EmployeeService.Data;
using EmployeeService.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeService.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly EmployeeDbContext _context;

        public EmployeeRepository(EmployeeDbContext context)
        {
            _context = context;
        }

        public async Task<Employee> AddAsync(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task<Employee?> GetByIdAsync(Guid employeeId)
        {
            return await _context.Employees.FindAsync(employeeId);
        }

        public async Task<Employee?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<Employee>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return Enumerable.Empty<Employee>();

            var term = searchTerm.ToLower();

            return await _context.Employees
                .AsNoTracking()
                .Where(e => e.FirstName.ToLower().Contains(term)
                         || e.LastName.ToLower().Contains(term)
                         || e.Email.ToLower().Contains(term)
                         || e.Phone.ToLower().Contains(term))
                .ToListAsync();
        }

        public async Task<Employee> UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task DeleteAsync(Employee employee)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
        }
    }
}
