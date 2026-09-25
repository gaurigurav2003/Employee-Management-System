namespace AttendanceService.DTOs
{
    public class AttendanceUpdateDto
    {
        public DateTime? CheckOutTime { get; set; }

        public string? Status { get; set; }
    }
}