using Microsoft.EntityFrameworkCore;
using LeaveService.Models;

namespace LeaveService.Data
{
    public class LeaveDbContext : DbContext
    {
        public LeaveDbContext(DbContextOptions<LeaveDbContext> options) : base(options)
        {
        }

        public DbSet<Leave> Leaves { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Leave>(entity =>
            {
                entity.HasKey(l => l.LeaveId);

                entity.Property(l => l.EmployeeId).IsRequired();
                entity.Property(l => l.LeaveType).IsRequired();
                entity.Property(l => l.StartDate).IsRequired();
                entity.Property(l => l.EndDate).IsRequired();
                entity.Property(l => l.Reason).IsRequired();
                entity.Property(l => l.Status).IsRequired();
                entity.Property(l => l.AppliedAt).IsRequired();
                entity.Property(l => l.CreatedAt).IsRequired();
                entity.Property(l => l.UpdatedAt).IsRequired();
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
            var entries = ChangeTracker.Entries<Leave>();
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}
