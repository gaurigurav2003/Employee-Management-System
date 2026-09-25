using AttendanceService.Models;

namespace AttendanceService.Repositories
{
    public interface IAttendanceRepository
    {
        Task<Attendance> AddAsync(Attendance attendance);

        Task<Attendance?> GetByIdAsync(Guid attendanceId);

        Task<Attendance?> GetByEmployeeAndDateAsync(
            Guid employeeId,
            DateTime attendanceDate);

        Task<List<Attendance>> GetByEmployeeAsync(Guid employeeId);

        Task<List<Attendance>> GetAllAsync();

        Task<Attendance> UpdateAsync(Attendance attendance);
    }
}