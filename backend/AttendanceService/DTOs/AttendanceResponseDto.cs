namespace AttendanceService.DTOs
{
    public class AttendanceResponseDto
    {
        public Guid AttendanceId { get; set; }

        public Guid EmployeeId { get; set; }

        public DateTime AttendanceDate { get; set; }

        public DateTime CheckInTime { get; set; }

        public DateTime? CheckOutTime { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}