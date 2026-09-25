using SupportService.DTOs;
using SupportService.Models;
using SupportService.Repositories;

namespace SupportService.Services
{
    public class SupportTicketService : ISupportTicketService
    {
        private readonly ISupportTicketRepository _repository;

        public SupportTicketService(
            ISupportTicketRepository repository)
        {
            _repository = repository;
        }

        public async Task<SupportTicketResponseDto> CreateAsync(
            SupportTicketCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new ArgumentException("Title is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                throw new ArgumentException("Description is required.");
            }

            var ticket = new SupportTicket
            {
                TicketId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = "Open"
            };

            var createdTicket =
                await _repository.AddAsync(ticket);

            return MapToResponseDto(createdTicket);
        }

        public async Task<SupportTicketResponseDto?> GetByIdAsync(
            Guid ticketId)
        {
            var ticket =
                await _repository.GetByIdAsync(ticketId);

            return ticket == null
                ? null
                : MapToResponseDto(ticket);
        }

        public async Task<List<SupportTicketResponseDto>>
            GetByEmployeeAsync(Guid employeeId)
        {
            var tickets =
                await _repository.GetByEmployeeAsync(employeeId);

            return tickets
                .Select(MapToResponseDto)
                .ToList();
        }

        public async Task<List<SupportTicketResponseDto>>
            GetAllAsync()
        {
            var tickets =
                await _repository.GetAllAsync();

            return tickets
                .Select(MapToResponseDto)
                .ToList();
        }

        public async Task<SupportTicketResponseDto?> UpdateAsync(
            Guid ticketId,
            SupportTicketUpdateDto dto)
        {
            var ticket =
                await _repository.GetByIdAsync(ticketId);

            if (ticket == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                ticket.Status = dto.Status;

                if (dto.Status.Equals(
                    "Resolved",
                    StringComparison.OrdinalIgnoreCase))
                {
                    ticket.ResolvedAt = DateTime.UtcNow;
                }
            }

            if (dto.AssignedTo.HasValue)
            {
                ticket.AssignedTo = dto.AssignedTo;
            }

            var updatedTicket =
                await _repository.UpdateAsync(ticket);

            return MapToResponseDto(updatedTicket);
        }

        private static SupportTicketResponseDto MapToResponseDto(
            SupportTicket ticket)
        {
            return new SupportTicketResponseDto
            {
                TicketId = ticket.TicketId,
                EmployeeId = ticket.EmployeeId,
                Title = ticket.Title,
                Description = ticket.Description,
                Priority = ticket.Priority,
                Status = ticket.Status,
                AssignedTo = ticket.AssignedTo,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                ResolvedAt = ticket.ResolvedAt
            };
        }
    }
}