using SalaryService.Models;

namespace SalaryService.Repositories
{
    public interface ISalaryRepository
    {
        // EmployeeSalary
        Task<EmployeeSalary> AddEmployeeSalaryAsync(EmployeeSalary salary);
        Task<EmployeeSalary?> GetEmployeeSalaryByEmployeeIdAsync(Guid employeeId);
        Task<EmployeeSalary> UpdateEmployeeSalaryAsync(EmployeeSalary salary);

        // SalaryComponent
        Task<SalaryComponent> AddSalaryComponentAsync(SalaryComponent component);
        Task<IEnumerable<SalaryComponent>> GetSalaryComponentsByEmployeeIdAsync(Guid employeeId);
        Task<SalaryComponent?> GetSalaryComponentByIdAsync(Guid salaryComponentId);
        Task<SalaryComponent> UpdateSalaryComponentAsync(SalaryComponent component);

        // SalaryRevision
        Task<SalaryRevision> AddSalaryRevisionAsync(SalaryRevision revision);
        Task<IEnumerable<SalaryRevision>> GetSalaryRevisionsByEmployeeIdAsync(Guid employeeId);

        // Bonus
        Task<Bonus> AddBonusAsync(Bonus bonus);
        Task<IEnumerable<Bonus>> GetBonusesByEmployeeIdAsync(Guid employeeId);
        Task<Bonus?> GetBonusByIdAsync(Guid bonusId);
        Task<Bonus> UpdateBonusAsync(Bonus bonus);

        // Overtime
        Task<Overtime> AddOvertimeAsync(Overtime overtime);
        Task<IEnumerable<Overtime>> GetOvertimeByEmployeeIdAsync(Guid employeeId);
        Task<Overtime?> GetOvertimeByIdAsync(Guid overtimeId);
        Task<Overtime> UpdateOvertimeAsync(Overtime overtime);

        // Payroll and Payslip - basic operations
        Task<Payroll> AddPayrollAsync(Payroll payroll);
        Task<IEnumerable<Payroll>> GetPayrollsAsync();
        Task<Payroll?> GetPayrollByIdAsync(Guid payrollId);
        Task<PayrollItem> AddPayrollItemAsync(PayrollItem item);
        Task<IEnumerable<PayrollItem>> GetPayrollItemsByPayrollIdAsync(Guid payrollId);

        Task<Payslip> AddPayslipAsync(Payslip payslip);
        Task<IEnumerable<Payslip>> GetPayslipsByEmployeeIdAsync(Guid employeeId);
        Task<Payslip?> GetPayslipByIdAsync(Guid payslipId);
    }
}
