namespace EmployeeService.DTOs
{
    public class EmployeeUpdateDto
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public DateTime DateOfJoining { get; set; }

        public Guid DepartmentId { get; set; }

        public string Role { get; set; }

        public string EmploymentStatus { get; set; }
    }
}