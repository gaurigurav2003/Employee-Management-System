namespace AttendanceService.DTOs
{
    public class AttendanceCreateDto
    {
        public Guid EmployeeId { get; set; }

        public DateTime AttendanceDate { get; set; }

        public DateTime CheckInTime { get; set; }

        public string Status { get; set; } = "Present";
    }
}