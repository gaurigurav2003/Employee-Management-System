using Microsoft.EntityFrameworkCore;
using SalaryService.Data;
using SalaryService.Models;

namespace SalaryService.Repositories
{
    public class SalaryRepository : ISalaryRepository
    {
        private readonly SalaryDbContext _context;

        public SalaryRepository(SalaryDbContext context)
        {
            _context = context;
        }

        // EmployeeSalary
        public async Task<EmployeeSalary> AddEmployeeSalaryAsync(EmployeeSalary salary)
        {
            _context.EmployeeSalaries.Add(salary);
            await _context.SaveChangesAsync();
            return salary;
        }

        public async Task<EmployeeSalary?> GetEmployeeSalaryByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.EmployeeSalaries.AsNoTracking().FirstOrDefaultAsync(s => s.EmployeeId == employeeId);
        }

        public async Task<EmployeeSalary> UpdateEmployeeSalaryAsync(EmployeeSalary salary)
        {
            _context.EmployeeSalaries.Update(salary);
            await _context.SaveChangesAsync();
            return salary;
        }

        // SalaryComponent
        public async Task<SalaryComponent> AddSalaryComponentAsync(SalaryComponent component)
        {
            _context.SalaryComponents.Add(component);
            await _context.SaveChangesAsync();
            return component;
        }

        public async Task<IEnumerable<SalaryComponent>> GetSalaryComponentsByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.SalaryComponents.AsNoTracking().Where(c => c.EmployeeId == employeeId).ToListAsync();
        }

        public async Task<SalaryComponent?> GetSalaryComponentByIdAsync(Guid salaryComponentId)
        {
            return await _context.SalaryComponents.AsNoTracking().FirstOrDefaultAsync(c => c.SalaryComponentId == salaryComponentId);
        }

        public async Task<SalaryComponent> UpdateSalaryComponentAsync(SalaryComponent component)
        {
            _context.SalaryComponents.Update(component);
            await _context.SaveChangesAsync();
            return component;
        }

        // SalaryRevision
        public async Task<SalaryRevision> AddSalaryRevisionAsync(SalaryRevision revision)
        {
            _context.SalaryRevisions.Add(revision);
            await _context.SaveChangesAsync();
            return revision;
        }

        public async Task<IEnumerable<SalaryRevision>> GetSalaryRevisionsByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.SalaryRevisions.AsNoTracking()
                .Where(r => r.EmployeeId == employeeId)
                .OrderByDescending(r => r.RevisionDate)
                .ToListAsync();
        }

        // Bonus
        public async Task<Bonus> AddBonusAsync(Bonus bonus)
        {
            _context.Bonuses.Add(bonus);
            await _context.SaveChangesAsync();
            return bonus;
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Bonuses.AsNoTracking().Where(b => b.EmployeeId == employeeId).ToListAsync();
        }

        public async Task<Bonus?> GetBonusByIdAsync(Guid bonusId)
        {
            return await _context.Bonuses.AsNoTracking().FirstOrDefaultAsync(b => b.BonusId == bonusId);
        }

        public async Task<Bonus> UpdateBonusAsync(Bonus bonus)
        {
            _context.Bonuses.Update(bonus);
            await _context.SaveChangesAsync();
            return bonus;
        }

        // Overtime
        public async Task<Overtime> AddOvertimeAsync(Overtime overtime)
        {
            _context.Overtimes.Add(overtime);
            await _context.SaveChangesAsync();
            return overtime;
        }

        public async Task<IEnumerable<Overtime>> GetOvertimeByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Overtimes.AsNoTracking().Where(o => o.EmployeeId == employeeId).ToListAsync();
        }

        public async Task<Overtime?> GetOvertimeByIdAsync(Guid overtimeId)
        {
            return await _context.Overtimes.FindAsync(overtimeId);
        }

        public async Task<Overtime> UpdateOvertimeAsync(Overtime overtime)
        {
            _context.Overtimes.Update(overtime);
            await _context.SaveChangesAsync();
            return overtime;
        }

        // Payroll
        public async Task<Payroll> AddPayrollAsync(Payroll payroll)
        {
            _context.Payrolls.Add(payroll);
            await _context.SaveChangesAsync();
            return payroll;
        }

        public async Task<IEnumerable<Payroll>> GetPayrollsAsync()
        {
            return await _context.Payrolls.AsNoTracking().ToListAsync();
        }

        public async Task<Payroll?> GetPayrollByIdAsync(Guid payrollId)
        {
            return await _context.Payrolls.FindAsync(payrollId);
        }

        public async Task<PayrollItem> AddPayrollItemAsync(PayrollItem item)
        {
            _context.PayrollItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<IEnumerable<PayrollItem>> GetPayrollItemsByPayrollIdAsync(Guid payrollId)
        {
            return await _context.PayrollItems.AsNoTracking().Where(pi => pi.PayrollId == payrollId).ToListAsync();
        }

        // Payslip
        public async Task<Payslip> AddPayslipAsync(Payslip payslip)
        {
            _context.Payslips.Add(payslip);
            await _context.SaveChangesAsync();
            return payslip;
        }

        public async Task<IEnumerable<Payslip>> GetPayslipsByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Payslips.AsNoTracking().Where(p => p.EmployeeId == employeeId).ToListAsync();
        }

        public async Task<Payslip?> GetPayslipByIdAsync(Guid payslipId)
        {
            return await _context.Payslips.FindAsync(payslipId);
        }
    }
}
