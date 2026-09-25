namespace SalaryService.DTOs
{
    public class BonusResponseDto
    {
        public Guid BonusId { get; set; }

        public Guid EmployeeId { get; set; }

        public string BonusType { get; set; }

        public decimal Amount { get; set; }

        public DateTime BonusDate { get; set; }

        public string Reason { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
