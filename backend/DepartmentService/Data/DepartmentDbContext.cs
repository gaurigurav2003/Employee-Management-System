using Microsoft.EntityFrameworkCore;
using DepartmentService.Models;

namespace DepartmentService.Data
{
    public class DepartmentDbContext : DbContext
    {
        public DepartmentDbContext(DbContextOptions<DepartmentDbContext> options)
            : base(options)
        {
        }

        public DbSet<Department> Departments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(d => d.DepartmentId);

                entity.Property(d => d.DepartmentName)
                    .IsRequired();

                entity.HasIndex(d => d.DepartmentName)
                    .IsUnique();

                entity.Property(d => d.Description)
                    .IsRequired();

                entity.Property(d => d.CreatedAt)
                    .IsRequired();

                entity.Property(d => d.UpdatedAt)
                    .IsRequired();
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
            var entries = ChangeTracker.Entries<Department>();

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
