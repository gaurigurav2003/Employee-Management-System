using AttendanceService.DTOs;
using AttendanceService.Models;
using AttendanceService.Repositories;

namespace AttendanceService.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _repository;

        public AttendanceService(IAttendanceRepository repository)
        {
            _repository = repository;
        }

        public async Task<AttendanceResponseDto> CheckInAsync(
            AttendanceCreateDto dto)
        {
            var existingAttendance =
                await _repository.GetByEmployeeAndDateAsync(
                    dto.EmployeeId,
                    dto.AttendanceDate);

            if (existingAttendance != null)
            {
                throw new InvalidOperationException(
                    "Attendance already exists for this employee on this date.");
            }

            var attendance = new Attendance
            {
                AttendanceId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                AttendanceDate = dto.AttendanceDate.Date,
                CheckInTime = dto.CheckInTime,
                Status = dto.Status
            };

            var createdAttendance =
                await _repository.AddAsync(attendance);

            return MapToResponseDto(createdAttendance);
        }

        public async Task<AttendanceResponseDto?> GetByIdAsync(
            Guid attendanceId)
        {
            var attendance =
                await _repository.GetByIdAsync(attendanceId);

            if (attendance == null)
            {
                return null;
            }

            return MapToResponseDto(attendance);
        }

        public async Task<List<AttendanceResponseDto>> GetByEmployeeAsync(
            Guid employeeId)
        {
            var attendances =
                await _repository.GetByEmployeeAsync(employeeId);

            return attendances
                .Select(MapToResponseDto)
                .ToList();
        }

        public async Task<List<AttendanceResponseDto>> GetAllAsync()
        {
            var attendances =
                await _repository.GetAllAsync();

            return attendances
                .Select(MapToResponseDto)
                .ToList();
        }

        public async Task<AttendanceResponseDto?> CheckOutAsync(
            Guid attendanceId,
            AttendanceUpdateDto dto)
        {
            var attendance =
                await _repository.GetByIdAsync(attendanceId);

            if (attendance == null)
            {
                return null;
            }

            attendance.CheckOutTime =
                dto.CheckOutTime ?? DateTime.Now;

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                attendance.Status = dto.Status;
            }

            attendance.UpdatedAt = DateTime.Now;

            var updatedAttendance =
                await _repository.UpdateAsync(attendance);

            return MapToResponseDto(updatedAttendance);
        }

        private static AttendanceResponseDto MapToResponseDto(
            Attendance attendance)
        {
            return new AttendanceResponseDto
            {
                AttendanceId = attendance.AttendanceId,
                EmployeeId = attendance.EmployeeId,
                AttendanceDate = attendance.AttendanceDate,
                CheckInTime = attendance.CheckInTime,
                CheckOutTime = attendance.CheckOutTime,
                Status = attendance.Status,
                CreatedAt = attendance.CreatedAt,
                UpdatedAt = attendance.UpdatedAt
            };
        }
    }
}