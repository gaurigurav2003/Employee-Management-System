using AttendanceService.Data;
using AttendanceService.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceService.Repositories
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly AttendanceDbContext _context;

        public AttendanceRepository(AttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<Attendance> AddAsync(Attendance attendance)
        {
            await _context.Attendances.AddAsync(attendance);
            await _context.SaveChangesAsync();

            return attendance;
        }

        public async Task<Attendance?> GetByIdAsync(Guid attendanceId)
        {
            return await _context.Attendances
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AttendanceId == attendanceId);
        }

        public async Task<Attendance?> GetByEmployeeAndDateAsync(
            Guid employeeId,
            DateTime attendanceDate)
        {
            return await _context.Attendances
                .AsNoTracking()
                .FirstOrDefaultAsync(a =>
                    a.EmployeeId == employeeId &&
                    a.AttendanceDate.Date == attendanceDate.Date);
        }

        public async Task<List<Attendance>> GetByEmployeeAsync(Guid employeeId)
        {
            return await _context.Attendances
                .AsNoTracking()
                .Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetAllAsync()
        {
            return await _context.Attendances
                .AsNoTracking()
                .OrderByDescending(a => a.AttendanceDate)
                .ToListAsync();
        }

        public async Task<Attendance> UpdateAsync(Attendance attendance)
        {
            _context.Attendances.Update(attendance);
            await _context.SaveChangesAsync();

            return attendance;
        }
    }
}