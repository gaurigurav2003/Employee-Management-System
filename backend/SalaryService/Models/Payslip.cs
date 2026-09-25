namespace SalaryService.Models
{
    public class Payslip
    {
        public Guid PayslipId { get; set; }

        public Guid PayrollId { get; set; }

        public Guid EmployeeId { get; set; }

        public string PayslipNumber { get; set; }

        public DateTime PayslipDate { get; set; }

        public decimal BasicSalary { get; set; }

        public decimal TotalComponents { get; set; }

        public decimal TotalBonus { get; set; }

        public decimal OvertimeAmount { get; set; }

        public decimal TotalDeductions { get; set; }

        public decimal NetSalary { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
