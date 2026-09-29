export type UserRole = 'Admin' | 'HR' | 'Manager' | 'Employee' | 'Support';

export interface UserSession {
  userId: string;
  employeeId: string;
  username: string;
  email?: string;
  role: UserRole;
  token: string;
  expiry?: string;
}

// RFC 7807 Error Response
export interface ApiErrorResponse {
  status?: number;
  code?: string;
  message?: string;
  traceId?: string;
  timestamp?: string;
  errors?: Array<{ field?: string; message: string }>;
}

// 1. AuthService Types (AuthService Swagger)
export interface LoginRequestDto {
  username?: string;
  password?: string;
}

export interface RegisterRequestDto {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

/** Request to create a new internal account (Admin/HR/Manager only). */
export interface CreateAccountRequestDto {
  email: string;
  role: string;
}

/** Response from the account creation endpoint. */
export interface CreateAccountResponseDto {
  userId: string;
  username: string;
  email: string;
  role: string;
  /** Plain-text activation token for constructing the activation link. */
  activationToken: string;
  activationTokenExpiresAt: string;
}

/** Request to activate an account (set password). */
export interface ActivateAccountRequestDto {
  token: string;
  password: string;
  confirmPassword: string;
}

// 2. EmployeeService Types (EmployeeService Swagger)
export interface EmployeeResponseDto {
  employeeId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfJoining: string;
  departmentId: string;
  role?: string | null;
  employmentStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId: string;
}

export interface EmployeeCreateDto {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfJoining: string;
  departmentId: string;
  role?: string;
  employmentStatus?: string;
}

export interface EmployeeUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfJoining: string;
  departmentId: string;
  role?: string;
  employmentStatus?: string;
}

// 3. DepartmentService Types (DepartmentService Swagger)
export interface DepartmentResponseDto {
  departmentId: string;
  departmentName?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentCreateDto {
  departmentName?: string;
  description?: string;
}

export interface DepartmentUpdateDto {
  departmentName?: string;
  description?: string;
}

// 4. SalaryService Types (SalaryService Swagger)
export interface EmployeeSalaryCreateDto {
  employeeId: string;
  basicSalary: number;
  effectiveFrom: string;
}

export interface EmployeeSalaryUpdateDto {
  basicSalary: number;
  effectiveFrom: string;
}

export interface EmployeeSalaryResponseDto {
  employeeSalaryId: string;
  employeeId: string;
  basicSalary: number;
  effectiveFrom: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryComponentCreateDto {
  employeeId: string;
  componentName?: string;
  amount: number;
  componentType?: string; // Earning, Deduction
}

export interface SalaryComponentUpdateDto {
  componentName?: string;
  amount: number;
  componentType?: string;
}

export interface SalaryComponentResponseDto {
  salaryComponentId: string;
  employeeId: string;
  componentName?: string | null;
  amount: number;
  componentType?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRevisionCreateDto {
  employeeId: string;
  previousSalary: number;
  revisedSalary: number;
  revisionDate: string;
  reason?: string;
}

export interface SalaryRevisionResponseDto {
  salaryRevisionId: string;
  employeeId: string;
  previousSalary: number;
  revisedSalary: number;
  revisionDate: string;
  reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BonusCreateDto {
  employeeId: string;
  bonusType?: string;
  amount: number;
  bonusDate: string;
  reason?: string;
}

export interface BonusUpdateDto {
  bonusType?: string;
  amount: number;
  bonusDate: string;
  reason?: string;
}

export interface BonusResponseDto {
  bonusId: string;
  employeeId: string;
  bonusType?: string | null;
  amount: number;
  bonusDate: string;
  reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimeCreateDto {
  employeeId: string;
  overtimeDate: string;
  hours: number;
  rate: number;
}

export interface OvertimeResponseDto {
  overtimeId: string;
  employeeId: string;
  overtimeDate: string;
  hours: number;
  rate: number;
  amount: number;
  status?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratePayrollRequest {
  month: number;
  year: number;
}

export interface PayrollResponseDto {
  payrollId: string;
  payrollMonth: number;
  payrollYear: number;
  generatedAt: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollItemResponseDto {
  payrollItemId: string;
  payrollId: string;
  employeeId: string;
  basicSalary: number;
  totalComponents: number;
  totalBonus: number;
  overtimeAmount: number;
  totalDeductions: number;
  netSalary: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayslipResponseDto {
  payslipId: string;
  payrollId: string;
  employeeId: string;
  payslipNumber?: string | null;
  payslipDate: string;
  basicSalary: number;
  totalComponents: number;
  totalBonus: number;
  overtimeAmount: number;
  totalDeductions: number;
  netSalary: number;
  createdAt?: string;
  updatedAt?: string;
}

// 5. LeaveService Types (LeaveService Swagger)
export interface LeaveCreateDto {
  employeeId: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveResponseDto {
  leaveId: string;
  employeeId: string;
  leaveType?: string | null;
  startDate: string;
  endDate: string;
  reason?: string | null;
  status?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  appliedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 6. AttendanceService Types (AttendanceService Swagger)
export interface AttendanceCreateDto {
  employeeId: string;
  attendanceDate: string;
  checkInTime: string;
  status?: string | null;
}

export interface AttendanceUpdateDto {
  checkOutTime?: string | null;
  status?: string | null;
}

export interface AttendanceResponseDto {
  attendanceId: string;
  employeeId: string;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// 7. SupportService Types (SupportService Swagger)
export interface SupportTicketCreateDto {
  employeeId: string;
  title?: string;
  description?: string;
  priority?: string;
}

export interface SupportTicketUpdateDto {
  status?: string;
  assignedTo?: string | null;
}

export interface SupportTicketResponseDto {
  ticketId: string;
  employeeId: string;
  title?: string | null;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  assignedTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
