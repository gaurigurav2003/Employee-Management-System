namespace SalaryService.DTOs
{
    public class OvertimeCreateDto
    {
        public Guid EmployeeId { get; set; }

        public DateTime OvertimeDate { get; set; }

        public decimal Hours { get; set; }

        public decimal Rate { get; set; }
    }
}
