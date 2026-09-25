namespace SalaryService.DTOs
{
    public class EmployeeSalaryResponseDto
    {
        public Guid EmployeeSalaryId { get; set; }

        public Guid EmployeeId { get; set; }

        public decimal BasicSalary { get; set; }

        public DateTime EffectiveFrom { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
