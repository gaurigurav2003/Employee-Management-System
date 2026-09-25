namespace SalaryService.Models
{
    public class SalaryRevision
    {
        public Guid SalaryRevisionId { get; set; }

        public Guid EmployeeId { get; set; }

        public decimal PreviousSalary { get; set; }

        public decimal RevisedSalary { get; set; }

        public DateTime RevisionDate { get; set; }

        public string Reason { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
