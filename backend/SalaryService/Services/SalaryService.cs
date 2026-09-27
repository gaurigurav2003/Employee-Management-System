using SalaryService.DTOs;
using SalaryService.Models;
using SalaryService.Repositories;

namespace SalaryService.Services
{
    public class SalaryService : ISalaryService
    {
        private readonly ISalaryRepository _repo;

        public SalaryService(ISalaryRepository repo)
        {
            _repo = repo;
        }

        // EmployeeSalary
        public async Task<EmployeeSalaryResponseDto> CreateEmployeeSalaryAsync(EmployeeSalaryCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");
            if (dto.BasicSalary < 0) throw new ArgumentException("BasicSalary must be >= 0");

            var entity = new EmployeeSalary
            {
                EmployeeSalaryId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                BasicSalary = dto.BasicSalary,
                EffectiveFrom = dto.EffectiveFrom
            };

            var created = await _repo.AddEmployeeSalaryAsync(entity);
            return Map(created);
        }

        public async Task<EmployeeSalaryResponseDto> GetEmployeeSalaryByEmployeeIdAsync(Guid employeeId)
        {
            var e = await _repo.GetEmployeeSalaryByEmployeeIdAsync(employeeId);
            if (e == null) throw new KeyNotFoundException("Employee salary not found");
            return Map(e);
        }

        public async Task<EmployeeSalaryResponseDto> UpdateEmployeeSalaryAsync(Guid employeeId, EmployeeSalaryUpdateDto dto)
        {
            var existing = await _repo.GetEmployeeSalaryByEmployeeIdAsync(employeeId);
            if (existing == null) throw new KeyNotFoundException("Employee salary not found");
            if (dto.BasicSalary < 0) throw new ArgumentException("BasicSalary must be >= 0");

            existing.BasicSalary = dto.BasicSalary;
            existing.EffectiveFrom = dto.EffectiveFrom;

            var updated = await _repo.UpdateEmployeeSalaryAsync(existing);
            return Map(updated);
        }

        // SalaryComponent
        public async Task<SalaryComponentResponseDto> AddSalaryComponentAsync(SalaryComponentCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");
            if (dto.Amount < 0) throw new ArgumentException("Amount must be >= 0");

            var entity = new SalaryComponent
            {
                SalaryComponentId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                ComponentName = dto.ComponentName,
                Amount = dto.Amount,
                ComponentType = dto.ComponentType
            };

            var created = await _repo.AddSalaryComponentAsync(entity);
            return Map(created);
        }

        public async Task<IEnumerable<SalaryComponentResponseDto>> GetSalaryComponentsAsync(Guid employeeId)
        {
            var list = await _repo.GetSalaryComponentsByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<SalaryComponentResponseDto> UpdateSalaryComponentAsync(Guid salaryComponentId, SalaryComponentUpdateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");

            var comp = await _repo.GetSalaryComponentByIdAsync(salaryComponentId);
            if (comp == null) throw new KeyNotFoundException("Salary component not found");

            if (dto.Amount < 0) throw new ArgumentException("Amount must be >= 0");

            comp.ComponentName = dto.ComponentName;
            comp.Amount = dto.Amount;
            comp.ComponentType = dto.ComponentType;

            var updated = await _repo.UpdateSalaryComponentAsync(comp);
            return Map(updated);
        }

        public async Task DeleteSalaryComponentAsync(Guid salaryComponentId)
        {
            var comp = await _repo.GetSalaryComponentByIdAsync(salaryComponentId);

            if (comp == null)
                throw new KeyNotFoundException("Salary component not found");

            await _repo.DeleteSalaryComponentAsync(comp);
        }

        // SalaryRevision
        public async Task<SalaryRevisionResponseDto> AddSalaryRevisionAsync(
    SalaryRevisionCreateDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Data required");

            if (dto.RevisedSalary < 0)
                throw new ArgumentException("Revised salary must be >= 0");

            var existingSalary =
                await _repo.GetEmployeeSalaryByEmployeeIdAsync(dto.EmployeeId);

            if (existingSalary == null)
                throw new KeyNotFoundException("Employee salary not found");

            var previousSalary = existingSalary.BasicSalary;

            if (dto.RevisedSalary == previousSalary)
                throw new ArgumentException(
                    "Revised salary must be different from current salary");

            var revision = new SalaryRevision
            {
                SalaryRevisionId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                PreviousSalary = previousSalary,
                RevisedSalary = dto.RevisedSalary,
                RevisionDate = dto.RevisionDate,
                Reason = dto.Reason
            };

            // Update current employee salary
            existingSalary.BasicSalary = dto.RevisedSalary;
            existingSalary.EffectiveFrom = dto.RevisionDate;

            // Save revision history
            var created = await _repo.AddSalaryRevisionAsync(revision);

            // Update current salary
            await _repo.UpdateEmployeeSalaryAsync(existingSalary);

            return Map(created);
        }

        public async Task<IEnumerable<SalaryRevisionResponseDto>> GetSalaryRevisionsAsync(Guid employeeId)
        {
            var list = await _repo.GetSalaryRevisionsByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        // Bonus
        public async Task<BonusResponseDto> AddBonusAsync(BonusCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");
            if (dto.Amount < 0) throw new ArgumentException("Amount must be >= 0");

            var b = new Bonus
            {
                BonusId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                BonusType = dto.BonusType,
                Amount = dto.Amount,
                BonusDate = dto.BonusDate,
                Reason = dto.Reason
            };

            var created = await _repo.AddBonusAsync(b);
            return Map(created);
        }

        public async Task<IEnumerable<BonusResponseDto>> GetBonusesAsync(Guid employeeId)
        {
            var list = await _repo.GetBonusesByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<BonusResponseDto> UpdateBonusAsync(Guid bonusId, BonusUpdateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");

            var b = await _repo.GetBonusByIdAsync(bonusId);
            if (b == null) throw new KeyNotFoundException("Bonus not found");

            if (dto.Amount < 0) throw new ArgumentException("Amount must be >= 0");

            b.BonusType = dto.BonusType;
            b.Amount = dto.Amount;
            b.BonusDate = dto.BonusDate;
            b.Reason = dto.Reason;

            var updated = await _repo.UpdateBonusAsync(b);
            return Map(updated);
        }

        // Overtime
        public async Task<OvertimeResponseDto> AddOvertimeAsync(OvertimeCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");
            if (dto.Hours <= 0) throw new ArgumentException("Hours must be > 0");
            if (dto.Rate < 0) throw new ArgumentException("Rate must be >= 0");

            var ot = new Overtime
            {
                OvertimeId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                OvertimeDate = dto.OvertimeDate,
                Hours = dto.Hours,
                Rate = dto.Rate,
                Amount = dto.Hours * dto.Rate,
                Status = "Pending"
            };

            var created = await _repo.AddOvertimeAsync(ot);
            return Map(created);
        }

        public async Task<IEnumerable<OvertimeResponseDto>> GetOvertimeAsync(Guid employeeId)
        {
            var list = await _repo.GetOvertimeByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<OvertimeResponseDto> ApproveOvertimeAsync(Guid overtimeId, Guid approverId)
        {
            var ot = await _repo.GetOvertimeByIdAsync(overtimeId);
            if (ot == null) throw new KeyNotFoundException("Overtime not found");

            ot.Status = "Approved";
            ot.ApprovedBy = approverId;
            ot.ApprovedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateOvertimeAsync(ot);
            return Map(updated);
        }

        public async Task<OvertimeResponseDto> RejectOvertimeAsync(Guid overtimeId, Guid approverId)
        {
            var ot = await _repo.GetOvertimeByIdAsync(overtimeId);
            if (ot == null) throw new KeyNotFoundException("Overtime not found");

            ot.Status = "Rejected";
            ot.ApprovedBy = approverId;
            ot.ApprovedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateOvertimeAsync(ot);
            return Map(updated);
        }

        // Payroll - simple generation combining basic salary + components + bonuses + approved overtime
        public async Task<PayrollResponseDto> GeneratePayrollAsync(int month, int year)
        {
            if (month < 1 || month > 12)
                throw new ArgumentException("Invalid payroll month");

            if (year < 2000)
                throw new ArgumentException("Invalid payroll year");

            var payroll = new Payroll
            {
                PayrollId = Guid.NewGuid(),
                PayrollMonth = month,
                PayrollYear = year,
                GeneratedAt = DateTime.UtcNow,
                Status = "Generated"
            };

            var createdPayroll = await _repo.AddPayrollAsync(payroll);

            var salaries = await _repo.GetEmployeeSalariesAsync();

            foreach (var salary in salaries)
            {
                var components =
                    await _repo.GetSalaryComponentsByEmployeeIdAsync(salary.EmployeeId);

                var bonuses =
                    await _repo.GetBonusesByEmployeeIdAsync(salary.EmployeeId);

                var overtime =
                    await _repo.GetOvertimeByEmployeeIdAsync(salary.EmployeeId);

                var totalAllowances = components
    .Where(c => string.Equals(
        c.ComponentType?.Trim(),
        "Earning",
        StringComparison.OrdinalIgnoreCase))
    .Sum(c => c.Amount);

                var totalDeductions = components
                    .Where(c => string.Equals(
                        c.ComponentType?.Trim(),
                        "Deduction",
                        StringComparison.OrdinalIgnoreCase))
                    .Sum(c => c.Amount);

               

                var totalBonus = bonuses
                    .Where(b => b.BonusDate.Month == month &&
                                b.BonusDate.Year == year)
                    .Sum(b => b.Amount);

                var overtimeAmount = overtime
                    .Where(o => o.Status == "Approved" &&
                                o.OvertimeDate.Month == month &&
                                o.OvertimeDate.Year == year)
                    .Sum(o => o.Amount);

                var netSalary =
                    salary.BasicSalary
                    + totalAllowances
                    + totalBonus
                    + overtimeAmount
                    - totalDeductions;

                var item = new PayrollItem
                {
                    PayrollItemId = Guid.NewGuid(),
                    PayrollId = createdPayroll.PayrollId,
                    EmployeeId = salary.EmployeeId,
                    BasicSalary = salary.BasicSalary,
                    TotalComponents = totalAllowances,
                    TotalBonus = totalBonus,
                    OvertimeAmount = overtimeAmount,
                    TotalDeductions = totalDeductions,
                    NetSalary = netSalary
                };

                await _repo.AddPayrollItemAsync(item);
            }

            return Map(createdPayroll);
        }

        public async Task<IEnumerable<PayrollResponseDto>> GetPayrollsAsync()
        {
            var list = await _repo.GetPayrollsAsync();
            return list.Select(Map);
        }

        public async Task<PayrollResponseDto> GetPayrollByIdAsync(Guid payrollId)
        {
            var p = await _repo.GetPayrollByIdAsync(payrollId);
            if (p == null) throw new KeyNotFoundException("Payroll not found");
            return Map(p);
        }

        public async Task<IEnumerable<PayrollItemResponseDto>> GetPayrollItemsAsync(Guid payrollId)
        {
            var items = await _repo.GetPayrollItemsByPayrollIdAsync(payrollId);
            return items.Select(Map);
        }

        // Payslip
        // Payslip
        public async Task<PayslipResponseDto> GeneratePayslipAsync(
            Guid payrollId,
            Guid employeeId)
        {
            // Get payroll
            var payroll = await _repo.GetPayrollByIdAsync(payrollId);

            if (payroll == null)
                throw new KeyNotFoundException("Payroll not found");

            // Get CURRENT salary
            var salary = await _repo.GetEmployeeSalaryByEmployeeIdAsync(employeeId);

            if (salary == null)
                throw new KeyNotFoundException("Employee salary not found");

            // Get CURRENT salary components
            var components =
                await _repo.GetSalaryComponentsByEmployeeIdAsync(employeeId);

            // Earnings
            var totalAllowances = components
                .Where(c => string.Equals(
                    c.ComponentType?.Trim(),
                    "Earning",
                    StringComparison.OrdinalIgnoreCase))
                .Sum(c => c.Amount);

            // Deductions
            var totalDeductions = components
                .Where(c => string.Equals(
                    c.ComponentType?.Trim(),
                    "Deduction",
                    StringComparison.OrdinalIgnoreCase))
                .Sum(c => c.Amount);

            // Get bonuses for payroll month/year
            var bonuses =
                await _repo.GetBonusesByEmployeeIdAsync(employeeId);

            var totalBonus = bonuses
                .Where(b =>
                    b.BonusDate.Month == payroll.PayrollMonth &&
                    b.BonusDate.Year == payroll.PayrollYear)
                .Sum(b => b.Amount);

            // Get approved overtime for payroll month/year
            var overtime =
                await _repo.GetOvertimeByEmployeeIdAsync(employeeId);

            var overtimeAmount = overtime
                .Where(o =>
                    string.Equals(
                        o.Status?.Trim(),
                        "Approved",
                        StringComparison.OrdinalIgnoreCase) &&
                    o.OvertimeDate.Month == payroll.PayrollMonth &&
                    o.OvertimeDate.Year == payroll.PayrollYear)
                .Sum(o => o.Amount);

            // FINAL PAYSLIP CALCULATION
            var netSalary =
                salary.BasicSalary
                + totalAllowances
                + totalBonus
                + overtimeAmount
                - totalDeductions;

            var payslip = new Payslip
            {
                PayslipId = Guid.NewGuid(),
                PayrollId = payrollId,
                EmployeeId = employeeId,

                PayslipNumber = Guid.NewGuid().ToString(),
                PayslipDate = DateTime.UtcNow,

                BasicSalary = salary.BasicSalary,
                TotalComponents = totalAllowances,
                TotalBonus = totalBonus,
                OvertimeAmount = overtimeAmount,
                TotalDeductions = totalDeductions,

                NetSalary = netSalary
            };

            var created = await _repo.AddPayslipAsync(payslip);

            return Map(created);
        }

        public async Task<IEnumerable<PayslipResponseDto>> GetPayslipsForEmployeeAsync(Guid employeeId)
        {
            var list = await _repo.GetPayslipsByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<PayslipResponseDto> GetPayslipByIdAsync(Guid payslipId)
        {
            var p = await _repo.GetPayslipByIdAsync(payslipId);
            if (p == null) throw new KeyNotFoundException("Payslip not found");
            return Map(p);
        }

        // Mapping helpers
        private static EmployeeSalaryResponseDto Map(EmployeeSalary e) => new()
        {
            EmployeeSalaryId = e.EmployeeSalaryId,
            EmployeeId = e.EmployeeId,
            BasicSalary = e.BasicSalary,
            EffectiveFrom = e.EffectiveFrom,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt
        };

        private static SalaryComponentResponseDto Map(SalaryComponent c) => new()
        {
            SalaryComponentId = c.SalaryComponentId,
            EmployeeId = c.EmployeeId,
            ComponentName = c.ComponentName,
            Amount = c.Amount,
            ComponentType = c.ComponentType,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        };

        private static SalaryRevisionResponseDto Map(SalaryRevision r) => new()
        {
            SalaryRevisionId = r.SalaryRevisionId,
            EmployeeId = r.EmployeeId,
            PreviousSalary = r.PreviousSalary,
            RevisedSalary = r.RevisedSalary,
            RevisionDate = r.RevisionDate,
            Reason = r.Reason,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        };

        private static BonusResponseDto Map(Bonus b) => new()
        {
            BonusId = b.BonusId,
            EmployeeId = b.EmployeeId,
            BonusType = b.BonusType,
            Amount = b.Amount,
            BonusDate = b.BonusDate,
            Reason = b.Reason,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        };

        private static OvertimeResponseDto Map(Overtime o) => new()
        {
            OvertimeId = o.OvertimeId,
            EmployeeId = o.EmployeeId,
            OvertimeDate = o.OvertimeDate,
            Hours = o.Hours,
            Rate = o.Rate,
            Amount = o.Amount,
            Status = o.Status,
            ApprovedBy = o.ApprovedBy,
            ApprovedAt = o.ApprovedAt,
            CreatedAt = o.CreatedAt,
            UpdatedAt = o.UpdatedAt
        };

        private static PayrollResponseDto Map(Payroll p) => new()
        {
            PayrollId = p.PayrollId,
            PayrollMonth = p.PayrollMonth,
            PayrollYear = p.PayrollYear,
            GeneratedAt = p.GeneratedAt,
            Status = p.Status,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };

        private static PayrollItemResponseDto Map(PayrollItem i) => new()
        {
            PayrollItemId = i.PayrollItemId,
            PayrollId = i.PayrollId,
            EmployeeId = i.EmployeeId,
            BasicSalary = i.BasicSalary,
            TotalComponents = i.TotalComponents,
            TotalBonus = i.TotalBonus,
            OvertimeAmount = i.OvertimeAmount,
            TotalDeductions = i.TotalDeductions,
            NetSalary = i.NetSalary,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        };

        private static PayslipResponseDto Map(Payslip p) => new()
        {
            PayslipId = p.PayslipId,
            PayrollId = p.PayrollId,
            EmployeeId = p.EmployeeId,
            PayslipNumber = p.PayslipNumber,
            PayslipDate = p.PayslipDate,
            BasicSalary = p.BasicSalary,
            TotalComponents = p.TotalComponents,
            TotalBonus = p.TotalBonus,
            OvertimeAmount = p.OvertimeAmount,
            TotalDeductions = p.TotalDeductions,
            NetSalary = p.NetSalary,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
