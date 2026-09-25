using SupportService.Models;

namespace SupportService.Repositories
{
    public interface ISupportTicketRepository
    {
        Task<SupportTicket> AddAsync(SupportTicket ticket);

        Task<SupportTicket?> GetByIdAsync(Guid ticketId);

        Task<List<SupportTicket>> GetByEmployeeAsync(Guid employeeId);

        Task<List<SupportTicket>> GetAllAsync();

        Task<SupportTicket> UpdateAsync(SupportTicket ticket);
    }
}