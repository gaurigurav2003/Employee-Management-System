using EmployeeService.DTOs;
using EmployeeService.Repositories;

namespace EmployeeService.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        public Task<EmployeeResponseDto> CreateEmployeeAsync(EmployeeCreateDto employeeDto)
        {
            throw new NotImplementedException();
        }

        public Task<EmployeeResponseDto> GetEmployeeByIdAsync(Guid employeeId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<EmployeeResponseDto>> SearchEmployeesAsync(string searchTerm)
        {
            throw new NotImplementedException();
        }

        public Task<EmployeeResponseDto> UpdateEmployeeAsync(
            Guid employeeId,
            EmployeeUpdateDto employeeDto)
        {
            throw new NotImplementedException();
        }

        public Task DeleteEmployeeAsync(Guid employeeId)
        {
            throw new NotImplementedException();
        }
    }
}