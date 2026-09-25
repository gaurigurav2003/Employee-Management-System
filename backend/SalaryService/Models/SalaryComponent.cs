namespace SalaryService.Models
{
    public class SalaryComponent
    {
        public Guid SalaryComponentId { get; set; }

        public Guid EmployeeId { get; set; }

        public string ComponentName { get; set; }

        public decimal Amount { get; set; }

        public string ComponentType { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
