namespace SalaryService.DTOs
{
    public class SalaryComponentCreateDto
    {
        public Guid EmployeeId { get; set; }

        public string ComponentName { get; set; }

        public decimal Amount { get; set; }

        public string ComponentType { get; set; }
    }
}
