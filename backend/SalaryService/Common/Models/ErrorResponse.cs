namespace SalaryService.Common.Models
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
