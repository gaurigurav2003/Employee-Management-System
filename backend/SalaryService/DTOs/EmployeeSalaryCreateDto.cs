namespace SalaryService.DTOs
{
    public class EmployeeSalaryCreateDto
    {
        public Guid EmployeeId { get; set; }

        public decimal BasicSalary { get; set; }

        public DateTime EffectiveFrom { get; set; }
    }
}
