using LeaveService.DTOs;

namespace LeaveService.Services
{
    public interface ILeaveService
    {
        Task<LeaveResponseDto> ApplyLeaveAsync(LeaveCreateDto dto);
        Task<LeaveResponseDto> GetLeaveByIdAsync(Guid leaveId);
        Task<IEnumerable<LeaveResponseDto>> GetLeavesByEmployeeAsync(Guid employeeId);
        Task<IEnumerable<LeaveResponseDto>> GetLeaveHistoryAsync(Guid employeeId);
        Task<LeaveResponseDto> ApproveLeaveAsync(Guid leaveId, Guid approverId);
        Task<LeaveResponseDto> RejectLeaveAsync(Guid leaveId, Guid approverId);
    }
}
