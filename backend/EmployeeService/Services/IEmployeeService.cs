using EmployeeService.DTOs;

namespace EmployeeService.Services
{
    public interface IEmployeeService
    {
        Task<EmployeeResponseDto> CreateEmployeeAsync(EmployeeCreateDto employeeDto);

        Task<EmployeeResponseDto> GetEmployeeByIdAsync(Guid employeeId);

        Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync();

        Task<IEnumerable<EmployeeResponseDto>> SearchEmployeesAsync(string searchTerm);

        Task<EmployeeResponseDto> UpdateEmployeeAsync(
            Guid employeeId,
            EmployeeUpdateDto employeeDto);

        Task DeleteEmployeeAsync(Guid employeeId);
    }
}