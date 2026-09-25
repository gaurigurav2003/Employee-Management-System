using Microsoft.EntityFrameworkCore;
using LeaveService.Data;
using LeaveService.Models;

namespace LeaveService.Repositories
{
    public class LeaveRepository : ILeaveRepository
    {
        private readonly LeaveDbContext _context;

        public LeaveRepository(LeaveDbContext context)
        {
            _context = context;
        }

        public async Task<Leave> AddAsync(Leave leave)
        {
            _context.Leaves.Add(leave);
            await _context.SaveChangesAsync();
            return leave;

        }

        public async Task<Leave?> GetByIdAsync(Guid leaveId)
        {
            return await _context.Leaves.FindAsync(leaveId);

        }

        public async Task<IEnumerable<Leave>> GetByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Leaves.AsNoTracking().Where(l => l.EmployeeId == employeeId).ToListAsync();

        }

        public async Task<IEnumerable<Leave>> GetHistoryByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Leaves.AsNoTracking().Where(l => l.EmployeeId == employeeId).OrderByDescending(l => l.AppliedAt).ToListAsync();

        }

        public async Task<Leave> UpdateAsync(Leave leave)
        {
            _context.Leaves.Update(leave);
            await _context.SaveChangesAsync();
            return leave;
        }
    }
}
