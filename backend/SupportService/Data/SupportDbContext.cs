using Microsoft.EntityFrameworkCore;
using SupportService.Models;

namespace SupportService.Data
{
    public class SupportDbContext : DbContext
    {
        public SupportDbContext(DbContextOptions<SupportDbContext> options)
            : base(options)
        {
        }

        public DbSet<SupportTicket> SupportTickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SupportTicket>(entity =>
            {
                entity.HasKey(t => t.TicketId);

                entity.Property(t => t.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(t => t.Description)
                    .IsRequired();

                entity.Property(t => t.Priority)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(t => t.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(t => t.EmployeeId);
            });
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<SupportTicket>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.TicketId = Guid.NewGuid();
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                }
            }
        }
    }
}