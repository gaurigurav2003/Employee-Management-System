namespace SalaryService.DTOs
{
    public class EmployeeSalaryUpdateDto
    {
        public decimal BasicSalary { get; set; }

        public DateTime EffectiveFrom { get; set; }
    }
}
