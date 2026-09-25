namespace SupportService.DTOs
{
    public class SupportTicketUpdateDto
    {
        public string? Status { get; set; }

        public Guid? AssignedTo { get; set; }
    }
}