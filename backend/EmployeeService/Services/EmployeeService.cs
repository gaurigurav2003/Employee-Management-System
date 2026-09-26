using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EmployeeService.DTOs;
using EmployeeService.Models;
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

        public async Task<EmployeeResponseDto> CreateEmployeeAsync(EmployeeCreateDto employeeDto)
        {
            if (employeeDto == null)
                throw new ArgumentException("Employee data is required.");

            if (string.IsNullOrWhiteSpace(employeeDto.FirstName)
                || string.IsNullOrWhiteSpace(employeeDto.LastName)
                || string.IsNullOrWhiteSpace(employeeDto.Email)
                || string.IsNullOrWhiteSpace(employeeDto.Phone)
                || string.IsNullOrWhiteSpace(employeeDto.Role)
                || string.IsNullOrWhiteSpace(employeeDto.EmploymentStatus))
            {
                throw new ArgumentException("One or more required fields are missing or empty.");
            }

            var employee = new Employee
            {
                EmployeeId = Guid.NewGuid(),
                FirstName = employeeDto.FirstName,
                LastName = employeeDto.LastName,
                Email = employeeDto.Email,
                Phone = employeeDto.Phone,
                DateOfJoining = employeeDto.DateOfJoining,
                DepartmentId = employeeDto.DepartmentId,
                Role = employeeDto.Role,
                EmploymentStatus = employeeDto.EmploymentStatus,
                 UserId = employeeDto.UserId,
            };

            var created = await _employeeRepository.AddAsync(employee);

            return MapToResponseDto(created);
        }

        public async Task<EmployeeResponseDto> GetEmployeeByIdAsync(Guid employeeId)
        {
            var employee = await _employeeRepository.GetByIdAsync(employeeId);

            if (employee == null)
                throw new KeyNotFoundException("Employee not found.");

            return MapToResponseDto(employee);
        }

        public async Task<EmployeeResponseDto> GetMyProfileAsync(Guid userId)
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);

            if (employee == null)
                throw new KeyNotFoundException("Employee profile not found.");

            return MapToResponseDto(employee);
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllAsync();
            return employees.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<EmployeeResponseDto>> SearchEmployeesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                throw new ArgumentException("searchTerm is required.");

            var employees = await _employeeRepository.SearchAsync(searchTerm);
            return employees.Select(MapToResponseDto);
        }

        public async Task<EmployeeResponseDto> UpdateEmployeeAsync(
            Guid employeeId,
            EmployeeUpdateDto employeeDto)
        {
            if (employeeDto == null)
                throw new ArgumentException("Employee data is required.");

            var existing = await _employeeRepository.GetByIdAsync(employeeId);

            if (existing == null)
                throw new KeyNotFoundException("Employee not found.");

            existing.FirstName = employeeDto.FirstName;
            existing.LastName = employeeDto.LastName;
            existing.Email = employeeDto.Email;
            existing.Phone = employeeDto.Phone;
            existing.DateOfJoining = employeeDto.DateOfJoining;
            existing.DepartmentId = employeeDto.DepartmentId;
            existing.Role = employeeDto.Role;
            existing.EmploymentStatus = employeeDto.EmploymentStatus;

            var updated = await _employeeRepository.UpdateAsync(existing);

            return MapToResponseDto(updated);
        }

        public async Task DeleteEmployeeAsync(Guid employeeId)
        {
            var existing = await _employeeRepository.GetByIdAsync(employeeId);

            if (existing == null)
                throw new KeyNotFoundException("Employee not found.");

            await _employeeRepository.DeleteAsync(existing);
        }

        private static EmployeeResponseDto MapToResponseDto(Employee e)
        {
            return new EmployeeResponseDto
            {
                EmployeeId = e.EmployeeId,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                DateOfJoining = e.DateOfJoining,
                DepartmentId = e.DepartmentId,
                Role = e.Role,
                EmploymentStatus = e.EmploymentStatus,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            };
        }
    }
}
