namespace SalaryService.Models
{
    public class Payroll
    {
        public Guid PayrollId { get; set; }

        public int PayrollMonth { get; set; }

        public int PayrollYear { get; set; }

        public DateTime GeneratedAt { get; set; }

        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
