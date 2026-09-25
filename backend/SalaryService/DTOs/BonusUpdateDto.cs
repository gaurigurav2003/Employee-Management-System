namespace SalaryService.DTOs
{
    public class BonusUpdateDto
    {
        public string BonusType { get; set; }

        public decimal Amount { get; set; }

        public DateTime BonusDate { get; set; }

        public string Reason { get; set; }
    }
}
