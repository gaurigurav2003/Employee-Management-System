using DepartmentService.Data;
using DepartmentService.Models;
using Microsoft.EntityFrameworkCore;

namespace DepartmentService.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly DepartmentDbContext _context;

        public DepartmentRepository(DepartmentDbContext context)
        {
            _context = context;
        }

        public async Task<Department> AddAsync(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return department;
        }

        public async Task<Department?> GetByIdAsync(Guid departmentId)
        {
            return await _context.Departments.FindAsync(departmentId);
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Departments.AsNoTracking().ToListAsync();
        }

        public async Task<Department> UpdateAsync(Department department)
        {
            _context.Departments.Update(department);
            await _context.SaveChangesAsync();
            return department;
        }

        public async Task DeleteAsync(Department department)
        {
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
        }
    }
}
