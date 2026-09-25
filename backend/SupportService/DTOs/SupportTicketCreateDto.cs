namespace SupportService.DTOs
{
    public class SupportTicketCreateDto
    {
        public Guid EmployeeId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Priority { get; set; } = "Medium";
    }
}