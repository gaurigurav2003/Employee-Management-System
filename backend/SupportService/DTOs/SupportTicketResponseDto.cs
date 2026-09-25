namespace SupportService.DTOs
{
    public class SupportTicketResponseDto
    {
        public Guid TicketId { get; set; }

        public Guid EmployeeId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Priority { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public Guid? AssignedTo { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }
    }
}