namespace SalaryService.DTOs
{
    public class SalaryRevisionCreateDto
    {
        public Guid EmployeeId { get; set; }

        public decimal PreviousSalary { get; set; }

        public decimal RevisedSalary { get; set; }

        public DateTime RevisionDate { get; set; }

        public string Reason { get; set; }
    }
}
