using LeaveService.Models;

namespace LeaveService.Repositories
{
    public interface ILeaveRepository
    {
        Task<Leave> AddAsync(Leave leave);
        Task<Leave?> GetByIdAsync(Guid leaveId);
        Task<IEnumerable<Leave>> GetByEmployeeIdAsync(Guid employeeId);
        Task<IEnumerable<Leave>> GetHistoryByEmployeeIdAsync(Guid employeeId);
        Task<Leave> UpdateAsync(Leave leave);
    }
}
