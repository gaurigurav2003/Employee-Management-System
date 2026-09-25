using SupportService.DTOs;

namespace SupportService.Services
{
    public interface ISupportTicketService
    {
        Task<SupportTicketResponseDto> CreateAsync(
            SupportTicketCreateDto dto);

        Task<SupportTicketResponseDto?> GetByIdAsync(
            Guid ticketId);

        Task<List<SupportTicketResponseDto>> GetByEmployeeAsync(
            Guid employeeId);

        Task<List<SupportTicketResponseDto>> GetAllAsync();

        Task<SupportTicketResponseDto?> UpdateAsync(
            Guid ticketId,
            SupportTicketUpdateDto dto);
    }
}