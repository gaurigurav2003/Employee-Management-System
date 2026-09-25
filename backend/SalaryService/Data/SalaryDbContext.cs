using Microsoft.EntityFrameworkCore;
using SalaryService.Models;

namespace SalaryService.Data
{
    public class SalaryDbContext : DbContext
    {
        public SalaryDbContext(DbContextOptions<SalaryDbContext> options) : base(options)
        {
        }

        public DbSet<EmployeeSalary> EmployeeSalaries { get; set; }
        public DbSet<SalaryComponent> SalaryComponents { get; set; }
        public DbSet<SalaryRevision> SalaryRevisions { get; set; }
        public DbSet<Bonus> Bonuses { get; set; }
        public DbSet<Overtime> Overtimes { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<PayrollItem> PayrollItems { get; set; }
        public DbSet<Payslip> Payslips { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EmployeeSalary>(entity =>
            {
                entity.HasKey(e => e.EmployeeSalaryId);
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.EffectiveFrom).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<SalaryComponent>(entity =>
            {
                entity.HasKey(e => e.SalaryComponentId);
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.ComponentName).IsRequired();
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.ComponentType).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<SalaryRevision>(entity =>
            {
                entity.HasKey(e => e.SalaryRevisionId);
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.PreviousSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.RevisedSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.RevisionDate).IsRequired();
                entity.Property(e => e.Reason).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<Bonus>(entity =>
            {
                entity.HasKey(e => e.BonusId);
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.BonusType).IsRequired();
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.BonusDate).IsRequired();
                entity.Property(e => e.Reason).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<Overtime>(entity =>
            {
                entity.HasKey(e => e.OvertimeId);
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.OvertimeDate).IsRequired();
                entity.Property(e => e.Hours).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<Payroll>(entity =>
            {
                entity.HasKey(e => e.PayrollId);
                entity.Property(e => e.PayrollMonth).IsRequired();
                entity.Property(e => e.PayrollYear).IsRequired();
                entity.Property(e => e.GeneratedAt).IsRequired();
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });

            modelBuilder.Entity<PayrollItem>(entity =>
            {
                entity.HasKey(e => e.PayrollItemId);
                entity.Property(e => e.PayrollId).IsRequired();
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalComponents).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalBonus).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.OvertimeAmount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalDeductions).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.NetSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();

                entity.HasOne<Payroll>().WithMany().HasForeignKey(e => e.PayrollId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payslip>(entity =>
            {
                entity.HasKey(e => e.PayslipId);
                entity.Property(e => e.PayrollId).IsRequired();
                entity.Property(e => e.EmployeeId).IsRequired();
                entity.Property(e => e.PayslipNumber).IsRequired();
                entity.HasIndex(e => e.PayslipNumber).IsUnique();
                entity.Property(e => e.PayslipDate).IsRequired();
                entity.Property(e => e.BasicSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalComponents).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalBonus).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.OvertimeAmount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TotalDeductions).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.NetSalary).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();

                entity.HasOne<Payroll>().WithMany().HasForeignKey(e => e.PayrollId).OnDelete(DeleteBehavior.Cascade);
            });
        }

        public override int SaveChanges()
        {
            SetTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SetTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void SetTimestamps()
        {
            var entries = ChangeTracker.Entries();
            foreach (var entry in entries)
            {
                if (entry.Entity is null) continue;

                var createdProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "CreatedAt");
                var updatedProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");

                if (entry.State == EntityState.Added)
                {
                    if (createdProp != null) createdProp.CurrentValue = DateTime.UtcNow;
                    if (updatedProp != null) updatedProp.CurrentValue = DateTime.UtcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    if (updatedProp != null) updatedProp.CurrentValue = DateTime.UtcNow;
                }
            }
        }
    }
}
