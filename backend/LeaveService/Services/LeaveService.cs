using LeaveService.DTOs;
using LeaveService.Models;
using LeaveService.Repositories;

namespace LeaveService.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly ILeaveRepository _repo;

        public LeaveService(ILeaveRepository repo)
        {
            _repo = repo;
        }

        public async Task<LeaveResponseDto> ApplyLeaveAsync(LeaveCreateDto dto)
        {
            if (dto == null) throw new ArgumentException("Leave data required");
            if (dto.EmployeeId == Guid.Empty) throw new ArgumentException("EmployeeId is required");
            if (string.IsNullOrWhiteSpace(dto.LeaveType)) throw new ArgumentException("LeaveType is required");
            if (dto.StartDate == default || dto.EndDate == default) throw new ArgumentException("StartDate and EndDate are required");
            if (dto.StartDate > dto.EndDate) throw new ArgumentException("StartDate must be less than or equal to EndDate");
            if (string.IsNullOrWhiteSpace(dto.Reason)) throw new ArgumentException("Reason is required");
            var leave = new Leave
            {
                LeaveId = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                LeaveType = dto.LeaveType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending",
                AppliedAt = DateTime.UtcNow
            };
            var created = await _repo.AddAsync(leave);
            return Map(created);
        }

        public async Task<LeaveResponseDto> GetLeaveByIdAsync(Guid leaveId)
        {
            var leave = await _repo.GetByIdAsync(leaveId);
            if (leave == null) throw new KeyNotFoundException("Leave not found");
            return Map(leave);
        }

        public async Task<IEnumerable<LeaveResponseDto>> GetLeavesByEmployeeAsync(Guid employeeId)
        {
            var list = await _repo.GetByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<IEnumerable<LeaveResponseDto>> GetLeaveHistoryAsync(Guid employeeId)
        {
            var list = await _repo.GetHistoryByEmployeeIdAsync(employeeId);
            return list.Select(Map);
        }

        public async Task<LeaveResponseDto> ApproveLeaveAsync(Guid leaveId, Guid approverId)
        {
            var leave = await _repo.GetByIdAsync(leaveId);
            if (leave == null) throw new KeyNotFoundException("Leave not found");
            if (leave.Status != "Pending") throw new ArgumentException("Only pending leaves can be approved");

            leave.Status = "Approved";
            leave.ApprovedBy = approverId;
            leave.ApprovedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateAsync(leave);
            return Map(updated);
        }

        public async Task<LeaveResponseDto> RejectLeaveAsync(Guid leaveId, Guid approverId)
        {
            var leave = await _repo.GetByIdAsync(leaveId);
            if (leave == null) throw new KeyNotFoundException("Leave not found");
            if (leave.Status != "Pending") throw new ArgumentException("Only pending leaves can be rejected");

            leave.Status = "Rejected";
            leave.ApprovedBy = approverId;
            leave.ApprovedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateAsync(leave);
            return Map(updated);
        }

        private static LeaveResponseDto Map(Leave l) => new()
        {
            LeaveId = l.LeaveId,
            EmployeeId = l.EmployeeId,
            LeaveType = l.LeaveType,
            StartDate = l.StartDate,
            EndDate = l.EndDate,
            Reason = l.Reason,
            Status = l.Status,
            ApprovedBy = l.ApprovedBy,
            ApprovedAt = l.ApprovedAt,
            AppliedAt = l.AppliedAt,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt
        };
    }
}
