import { apiClient } from './client';
import {
  EmployeeSalaryCreateDto,
  EmployeeSalaryUpdateDto,
  EmployeeSalaryResponseDto,
  SalaryComponentCreateDto,
  SalaryComponentUpdateDto,
  SalaryComponentResponseDto,
  SalaryRevisionCreateDto,
  SalaryRevisionResponseDto,
  BonusCreateDto,
  BonusUpdateDto,
  BonusResponseDto,
  OvertimeCreateDto,
  OvertimeResponseDto,
  GeneratePayrollRequest,
  PayrollResponseDto,
  PayrollItemResponseDto,
  PayslipResponseDto,
} from '../types';

export const salaryApi = {
  // Employee Salary
  createSalary: async (dto: EmployeeSalaryCreateDto) => {
    return apiClient<EmployeeSalaryResponseDto>('/api/v1/salaries', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getSalaryByEmployeeId: async (employeeId: string) => {
    return apiClient<EmployeeSalaryResponseDto>(`/api/v1/salaries/${employeeId}`, {
      method: 'GET',
    });
  },

  updateSalary: async (employeeId: string, dto: EmployeeSalaryUpdateDto) => {
    return apiClient<EmployeeSalaryResponseDto>(`/api/v1/salaries/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  // Salary Components
  addComponent: async (employeeId: string, dto: SalaryComponentCreateDto) => {
    return apiClient<SalaryComponentResponseDto>(`/api/v1/salaries/${employeeId}/components`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  deleteComponent: async (salaryComponentId: string): Promise<void> => {
  await apiClient<void>(
    `/api/v1/salaries/components/${salaryComponentId}`,
    {
      method: 'DELETE',
    }
  );
},

  getComponentsByEmployeeId: async (employeeId: string) => {
    return apiClient<SalaryComponentResponseDto[]>(`/api/v1/salaries/${employeeId}/components`, {
      method: 'GET',
    });
  },

  updateComponent: async (salaryComponentId: string, dto: SalaryComponentUpdateDto) => {
    return apiClient<SalaryComponentResponseDto>(`/api/v1/salary-components/${salaryComponentId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  // Revisions
  createRevision: async (employeeId: string, dto: SalaryRevisionCreateDto) => {
    return apiClient<SalaryRevisionResponseDto>(`/api/v1/salaries/${employeeId}/revisions`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getRevisionsByEmployeeId: async (employeeId: string) => {
    return apiClient<SalaryRevisionResponseDto[]>(`/api/v1/salaries/${employeeId}/revisions`, {
      method: 'GET',
    });
  },

  // Bonuses
  addBonus: async (employeeId: string, dto: BonusCreateDto) => {
    return apiClient<BonusResponseDto>(`/api/v1/salaries/${employeeId}/bonuses`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getBonusesByEmployeeId: async (employeeId: string) => {
    return apiClient<BonusResponseDto[]>(`/api/v1/salaries/${employeeId}/bonuses`, {
      method: 'GET',
    });
  },

  updateBonus: async (bonusId: string, dto: BonusUpdateDto) => {
    return apiClient<BonusResponseDto>(`/api/v1/bonuses/${bonusId}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  // Overtime
  submitOvertime: async (dto: OvertimeCreateDto) => {
    return apiClient<OvertimeResponseDto>('/api/v1/overtime', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getOvertimeByEmployeeId: async (employeeId: string) => {
    return apiClient<OvertimeResponseDto[]>(`/api/v1/overtime/${employeeId}`, {
      method: 'GET',
    });
  },

  approveOvertime: async (overtimeId: string, approvedBy: string) => {
    return apiClient<OvertimeResponseDto>(`/api/v1/overtime/${overtimeId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(approvedBy),
    });
  },

  rejectOvertime: async (overtimeId: string, rejectedBy: string) => {
    return apiClient<OvertimeResponseDto>(`/api/v1/overtime/${overtimeId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(rejectedBy),
    });
  },

  // Payroll
  generatePayroll: async (dto: GeneratePayrollRequest) => {
    return apiClient<PayrollResponseDto>('/api/v1/payroll', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getPayrolls: async () => {
    return apiClient<PayrollResponseDto[]>('/api/v1/payroll', {
      method: 'GET',
    });
  },

  getPayrollById: async (payrollId: string) => {
    return apiClient<PayrollResponseDto>(`/api/v1/payroll/${payrollId}`, {
      method: 'GET',
    });
  },

  getPayrollItems: async (payrollId: string) => {
    return apiClient<PayrollItemResponseDto[]>(`/api/v1/payroll/${payrollId}/items`, {
      method: 'GET',
    });
  },

  // Payslip
  generatePayslip: async (payrollId: string, employeeId: string) => {
    return apiClient<PayslipResponseDto>(`/api/v1/payslips/${payrollId}/${employeeId}`, {
      method: 'POST',
    });
  },

  getPayslipsByEmployeeId: async (employeeId?: string) => {
    const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
    return apiClient<PayslipResponseDto[]>(`/api/v1/payslips${query}`, {
      method: 'GET',
    });
  },

  getPayslipById: async (payslipId: string) => {
    return apiClient<PayslipResponseDto>(`/api/v1/payslips/${payslipId}`, {
      method: 'GET',
    });
  },
};
