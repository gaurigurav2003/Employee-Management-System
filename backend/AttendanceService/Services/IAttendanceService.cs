using AttendanceService.DTOs;

namespace AttendanceService.Services
{
    public interface IAttendanceService
    {
        Task<AttendanceResponseDto> CheckInAsync(AttendanceCreateDto dto);

        Task<AttendanceResponseDto?> GetByIdAsync(Guid attendanceId);

        Task<List<AttendanceResponseDto>> GetByEmployeeAsync(Guid employeeId);

        Task<List<AttendanceResponseDto>> GetAllAsync();

        Task<AttendanceResponseDto?> CheckOutAsync(
            Guid attendanceId,
            AttendanceUpdateDto dto);
    }
}