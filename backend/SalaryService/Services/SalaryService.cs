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

        // SalaryRevision
        public async Task<SalaryRevisionResponseDto> AddSalaryRevisionAsync(SalaryRevisionCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Data required");
            if (dto.PreviousSalary < 0 || dto.RevisedSalary < 0) throw new ArgumentException("Salary must be >= 0");

            var rev = new SalaryRevision
            {
                SalaryRevisionId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                PreviousSalary = dto.PreviousSalary,
                RevisedSalary = dto.RevisedSalary,
                RevisionDate = dto.RevisionDate,
                Reason = dto.Reason
            };

            var created = await _repo.AddSalaryRevisionAsync(rev);
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
            // Simple payroll generation: create Payroll record; creating PayrollItems is out of scope for full business logic
            var payroll = new Payroll
            {
                PayrollId = Guid.NewGuid(),
                PayrollMonth = month,
                PayrollYear = year,
                GeneratedAt = DateTime.UtcNow,
                Status = "Generated"
            };

            var created = await _repo.AddPayrollAsync(payroll);
            return Map(created);
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
        public async Task<PayslipResponseDto> GeneratePayslipAsync(Guid payrollId, Guid employeeId)
        {
            var payslip = new Payslip
            {
                PayslipId = Guid.NewGuid(),
                PayrollId = payrollId,
                EmployeeId = employeeId,
                PayslipNumber = Guid.NewGuid().ToString(),
                PayslipDate = DateTime.UtcNow,
                BasicSalary = 0,
                TotalComponents = 0,
                TotalBonus = 0,
                OvertimeAmount = 0,
                TotalDeductions = 0,
                NetSalary = 0
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
