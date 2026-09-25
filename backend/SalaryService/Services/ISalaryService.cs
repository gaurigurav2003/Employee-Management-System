using SalaryService.DTOs;

namespace SalaryService.Services
{
    public interface ISalaryService
    {
        // EmployeeSalary
        Task<EmployeeSalaryResponseDto> CreateEmployeeSalaryAsync(EmployeeSalaryCreateDto dto);
        Task<EmployeeSalaryResponseDto> GetEmployeeSalaryByEmployeeIdAsync(Guid employeeId);
        Task<EmployeeSalaryResponseDto> UpdateEmployeeSalaryAsync(Guid employeeId, EmployeeSalaryUpdateDto dto);

        // SalaryComponent
        Task<SalaryComponentResponseDto> AddSalaryComponentAsync(SalaryComponentCreateDto dto);
        Task<IEnumerable<SalaryComponentResponseDto>> GetSalaryComponentsAsync(Guid employeeId);
        Task<SalaryComponentResponseDto> UpdateSalaryComponentAsync(Guid salaryComponentId, SalaryComponentUpdateDto dto);

        // SalaryRevision
        Task<SalaryRevisionResponseDto> AddSalaryRevisionAsync(SalaryRevisionCreateDto dto);
        Task<IEnumerable<SalaryRevisionResponseDto>> GetSalaryRevisionsAsync(Guid employeeId);

        // Bonus
        Task<BonusResponseDto> AddBonusAsync(BonusCreateDto dto);
        Task<IEnumerable<BonusResponseDto>> GetBonusesAsync(Guid employeeId);
        Task<BonusResponseDto> UpdateBonusAsync(Guid bonusId, BonusUpdateDto dto);

        // Overtime
        Task<OvertimeResponseDto> AddOvertimeAsync(OvertimeCreateDto dto);
        Task<IEnumerable<OvertimeResponseDto>> GetOvertimeAsync(Guid employeeId);
        Task<OvertimeResponseDto> ApproveOvertimeAsync(Guid overtimeId, Guid approverId);
        Task<OvertimeResponseDto> RejectOvertimeAsync(Guid overtimeId, Guid approverId);

        // Payroll
        Task<PayrollResponseDto> GeneratePayrollAsync(int month, int year);
        Task<IEnumerable<PayrollResponseDto>> GetPayrollsAsync();
        Task<PayrollResponseDto> GetPayrollByIdAsync(Guid payrollId);
        Task<IEnumerable<PayrollItemResponseDto>> GetPayrollItemsAsync(Guid payrollId);

        // Payslip
        Task<PayslipResponseDto> GeneratePayslipAsync(Guid payrollId, Guid employeeId);
        Task<IEnumerable<PayslipResponseDto>> GetPayslipsForEmployeeAsync(Guid employeeId);
        Task<PayslipResponseDto> GetPayslipByIdAsync(Guid payslipId);
    }
}
