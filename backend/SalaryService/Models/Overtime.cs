namespace SalaryService.Models
{
    public class Overtime
    {
        public Guid OvertimeId { get; set; }

        public Guid EmployeeId { get; set; }

        public DateTime OvertimeDate { get; set; }

        public decimal Hours { get; set; }

        public decimal Rate { get; set; }

        public decimal Amount { get; set; }

        public string Status { get; set; }

        public Guid? ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
