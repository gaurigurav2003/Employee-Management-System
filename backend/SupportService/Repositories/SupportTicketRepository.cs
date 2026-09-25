using Microsoft.EntityFrameworkCore;
using SupportService.Data;
using SupportService.Models;

namespace SupportService.Repositories
{
    public class SupportTicketRepository : ISupportTicketRepository
    {
        private readonly SupportDbContext _context;

        public SupportTicketRepository(SupportDbContext context)
        {
            _context = context;
        }

        public async Task<SupportTicket> AddAsync(
            SupportTicket ticket)
        {
            await _context.SupportTickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            return ticket;
        }

        public async Task<SupportTicket?> GetByIdAsync(
            Guid ticketId)
        {
            return await _context.SupportTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);
        }

        public async Task<List<SupportTicket>> GetByEmployeeAsync(
            Guid employeeId)
        {
            return await _context.SupportTickets
                .AsNoTracking()
                .Where(t => t.EmployeeId == employeeId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<SupportTicket>> GetAllAsync()
        {
            return await _context.SupportTickets
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<SupportTicket> UpdateAsync(
            SupportTicket ticket)
        {
            _context.SupportTickets.Update(ticket);
            await _context.SaveChangesAsync();

            return ticket;
        }
    }
}