namespace SalaryService.DTOs
{
    public class BonusCreateDto
    {
        public Guid EmployeeId { get; set; }

        public string BonusType { get; set; }

        public decimal Amount { get; set; }

        public DateTime BonusDate { get; set; }

        public string Reason { get; set; }
    }
}
