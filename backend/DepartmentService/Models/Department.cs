namespace DepartmentService.Models
{
    public class Department
    {
        public Guid DepartmentId { get; set; }

        public string DepartmentName { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
