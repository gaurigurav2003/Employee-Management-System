import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { salaryApi } from '../api/salaryApi';
import { employeeApi } from '../api/employeeApi';
import {
  EmployeeResponseDto,
  EmployeeSalaryResponseDto,
  SalaryComponentResponseDto,
  SalaryRevisionResponseDto,
  BonusResponseDto,
  OvertimeResponseDto,
  PayrollResponseDto,
  PayslipResponseDto,
  OvertimeCreateDto,
  SalaryRevisionCreateDto,
  BonusCreateDto,
  SalaryComponentCreateDto,
  EmployeeSalaryCreateDto,
  GeneratePayrollRequest,
} from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  DollarSign,
  Plus,
  Clock,
  TrendingUp,
  FileText,
  Award,
  Calendar,
  Check,
  X,
  Eye,
  Layers,
  ChevronRight,
} from 'lucide-react';
export const SalaryPage: React.FC = () => {
  const { user, isAdmin, isHR } = useAuth();
  const { success, error: toastError } = useToast();
  const canManageSalary = isAdmin || isHR;
  // Selected employee for HR/Admin view
  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(user?.employeeId || '');
  // Salary Data State
  const [salary, setSalary] = useState<EmployeeSalaryResponseDto | null>(null);
  const [components, setComponents] = useState<SalaryComponentResponseDto[]>([]);
  const [revisions, setRevisions] = useState<SalaryRevisionResponseDto[]>([]);
  const [bonuses, setBonuses] = useState<BonusResponseDto[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeResponseDto[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollResponseDto[]>([]);
  const [payslips, setPayslips] = useState<PayslipResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Modals state
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] =
  useState<SalaryComponentResponseDto | null>(null);
const [isEditComponentModalOpen, setIsEditComponentModalOpen] =
  useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isViewPayslipOpen, setIsViewPayslipOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form Fields
  // Overtime Form
  const [otDate, setOtDate] = useState(new Date().toISOString().slice(0, 10));
  const [otHours, setOtHours] = useState('2');
  const [otRate, setOtRate] = useState('50');
  const [otReason, setOtReason] = useState('');
  // Salary Setup Form
  const [baseSalaryInput, setBaseSalaryInput] = useState('0');
  const [effectiveFromInput, setEffectiveFromInput] = useState(new Date().toISOString().slice(0, 10));
  // Component Form
  const [compName, setCompName] = useState('Housing Allowance');
  const [compAmount, setCompAmount] = useState('1200');
  const [compType, setCompType] = useState<'Earning' | 'Deduction'>('Earning');
  // Revision Form
  const [revisedAmount, setRevisedAmount] = useState('105000');
  const [revDate, setRevDate] = useState(new Date().toISOString().slice(0, 10));
  const [revReason, setRevReason] = useState('Annual Performance Appraisal 2026');
  // Bonus Form
  const [bonusType, setBonusType] = useState('Performance Bonus');
  const [bonusAmount, setBonusAmount] = useState('5000');
  const [bonusDate, setBonusDate] = useState(new Date().toISOString().slice(0, 10));
  const [bonusReason, setBonusReason] = useState('Q3 Target Achievement');
  // Payroll Form
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  // Load employee list for HR/Admin dropdown
  useEffect(() => {
    if (canManageSalary) {
      employeeApi.getAll().then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setEmployees(list);
          if (!selectedEmpId || selectedEmpId === user?.employeeId) {
            setSelectedEmpId(list[0].employeeId);
          }
        }
      }).catch(() => {});
    }
  }, [canManageSalary]);
  const targetEmpId = canManageSalary ? selectedEmpId : user?.employeeId;
  const loadSalaryData = async () => {
    if (!targetEmpId) return;
    setIsLoading(true);
    try {
      const [salRes, compRes, revRes, bonRes, otRes, slipRes] = await Promise.all([
        salaryApi.getSalaryByEmployeeId(targetEmpId).catch(() => null),
        salaryApi.getComponentsByEmployeeId(targetEmpId).catch(() => []),
        salaryApi.getRevisionsByEmployeeId(targetEmpId).catch(() => []),
        salaryApi.getBonusesByEmployeeId(targetEmpId).catch(() => []),
        salaryApi.getOvertimeByEmployeeId(targetEmpId).catch(() => []),
        salaryApi.getPayslipsByEmployeeId(targetEmpId).catch(() => []),
      ]);
      setSalary(salRes);
      setComponents(Array.isArray(compRes) ? compRes : []);
      setRevisions(Array.isArray(revRes) ? revRes : []);
      setBonuses(Array.isArray(bonRes) ? bonRes : []);
      setOvertimes(Array.isArray(otRes) ? otRes : []);
      setPayslips(Array.isArray(slipRes) ? slipRes : []);
      if (canManageSalary) {
        const prList = await salaryApi.getPayrolls().catch(() => []);
        setPayrolls(Array.isArray(prList) ? prList : []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadSalaryData();
  }, [targetEmpId]);
  // Form Handlers
  const handleSubmitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employeeId) return;
    setIsSubmitting(true);
    try {
      const dto: OvertimeCreateDto = {
        employeeId: user.employeeId,
        overtimeDate: new Date(otDate).toISOString(),
        hours: parseFloat(otHours),
        rate: parseFloat(otRate),
      };
      await salaryApi.submitOvertime(dto);
      success('Overtime request submitted for manager review.');
      setIsOvertimeModalOpen(false);
      setOtReason('');
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit overtime request.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;
    setIsSubmitting(true);
    try {
      if (!salary) {
        await salaryApi.createSalary({
          employeeId: targetEmpId,
          basicSalary: parseFloat(baseSalaryInput),
          effectiveFrom: new Date(effectiveFromInput).toISOString(),
        });
        success('Initial salary record created.');
      } else {
        await salaryApi.updateSalary(targetEmpId, {
          basicSalary: parseFloat(baseSalaryInput),
          effectiveFrom: new Date(effectiveFromInput).toISOString(),
        });
        success('Salary record updated.');
      }
      setIsSalaryModalOpen(false);
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to save salary.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;
    setIsSubmitting(true);
    try {
      await salaryApi.addComponent(targetEmpId, {
        employeeId: targetEmpId,
        componentName: compName,
        amount: parseFloat(compAmount),
        componentType: compType,
      });
      success('Salary component added.');
      setIsComponentModalOpen(false);
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to add salary component.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditComponent = (component: SalaryComponentResponseDto) => {
    setEditingComponent(component);
    setCompName(component.componentName || '');
    setCompAmount(String(component.amount));
    setCompType((component.componentType as 'Earning' | 'Deduction') || 'Earning');
    setIsEditComponentModalOpen(true);
  };
const handleUpdateComponent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingComponent) return;
  setIsSubmitting(true);
  try {
    await salaryApi.updateComponent(
      editingComponent.salaryComponentId,
      {
        componentName: compName,
        amount: parseFloat(compAmount),
        componentType: compType,
      }
    );
    success('Salary component updated.');
    setIsEditComponentModalOpen(false);
    setEditingComponent(null);
    loadSalaryData();
  } catch (err: any) {
    toastError(
      err.message || 'Failed to update salary component.',
      'Error'
    );
  } finally {
    setIsSubmitting(false);
  }
};
  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;
    setIsSubmitting(true);
    try {
      await salaryApi.createRevision(targetEmpId, {
        employeeId: targetEmpId,
        previousSalary: salary?.basicSalary || 0,
        revisedSalary: parseFloat(revisedAmount),
        revisionDate: new Date(revDate).toISOString(),
        reason: revReason,
      });
      success('Salary revision registered and updated.');
      setIsRevisionModalOpen(false);
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to revise salary.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;
    setIsSubmitting(true);
    try {
      await salaryApi.addBonus(targetEmpId, {
        employeeId: targetEmpId,
        bonusType,
        amount: parseFloat(bonusAmount),
        bonusDate: new Date(bonusDate).toISOString(),
        reason: bonusReason,
      });
      success('Bonus entry created.');
      setIsBonusModalOpen(false);
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to record bonus.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await salaryApi.generatePayroll({
        month: Number(payrollMonth),
        year: Number(payrollYear),
      });
      success(`Payroll successfully generated for period ${payrollMonth}/${payrollYear}.`);
      setIsPayrollModalOpen(false);
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to generate payroll.', 'Payroll Conflict', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleApproveOvertime = async (otId: string) => {
    if (!user) return;
    try {
      await salaryApi.approveOvertime(otId, user.employeeId);
      success('Overtime approved.');
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to approve overtime.');
    }
  };
  const handleRejectOvertime = async (otId: string) => {
    if (!user) return;
    try {
      await salaryApi.rejectOvertime(otId, user.employeeId);
      success('Overtime rejected.');
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to reject overtime.');
    }
  };
  const handleGeneratePayslip = async (payrollId: string) => {
    if (!targetEmpId) return;
    try {
      await salaryApi.generatePayslip(payrollId, targetEmpId);
      success('Payslip generated and payroll finalized.');
      loadSalaryData();
    } catch (err: any) {
      toastError(err.message || 'Failed to generate payslip.');
    }
  };
  // Calculations for display
  const currentBase = salary?.basicSalary || 0;
  const earnings = components.filter((c) => c.componentType === 'Earning');
  const deductions = components.filter((c) => c.componentType === 'Deduction');
  const totalEarnings = earnings.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalDeductions = deductions.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalBonus = bonuses.reduce(
  (acc, b) => acc + (b.amount || 0),
  0
);
const totalApprovedOvertime = overtimes
  .filter((ot) => (ot.status || '').toLowerCase() === 'approved')
  .reduce(
    (acc, ot) => acc + Number(ot.amount || ot.hours * ot.rate || 0),
    0
  );
const netCalculated =
  currentBase +
  totalEarnings +
  totalBonus +
  totalApprovedOvertime -
  totalDeductions;
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Wireframe 8 / 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / SALARY & PAYROLL
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {canManageSalary ? 'Salary & Payroll — Administration' : 'Salary & Payroll'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {canManageSalary
              ? 'Manage compensation, components, revisions, bonuses, overtime review, and payroll runs.'
              : 'View your salary, approved earnings, overtime, and payslips.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Request Overtime Button (available to all roles) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOvertimeModalOpen(true)}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Request overtime
          </Button>
          {canManageSalary && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {setBaseSalaryInput(String(salary?.basicSalary || 0)); 
                  setIsSalaryModalOpen(true);
                }}
                leftIcon={<DollarSign className="w-4 h-4" />}
              >
                Set Base Salary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsComponentModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Component
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevisionModalOpen(true)}
                leftIcon={<TrendingUp className="w-4 h-4" />}
              >
                Revise Salary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBonusModalOpen(true)}
                leftIcon={<Award className="w-4 h-4" />}
              >
                + Bonus
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPayrollModalOpen(true)}
                leftIcon={<Layers className="w-4 h-4" />}
              >
                Generate Payroll
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Admin/HR Employee Selector */}
      {canManageSalary && employees.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Select Employee Record:</span>
          </div>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
          >
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.firstName} {emp.lastName} ({emp.role || 'Employee'}) - {emp.employeeId.slice(0, 8)}...
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Top 2 Cards: Base Salary & Salary Components matching Wireframe 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Base Salary */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Basic Salary
              </span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2 font-mono">
              ${Number(currentBase).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Effective from:{' '}
              <strong>
                {salary?.effectiveFrom
                  ? new Date(salary.effectiveFrom).toLocaleDateString()
                  : 'Current fiscal year'}
              </strong>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Net calculated estimate:</span>
            <span className="font-bold text-slate-900 font-mono">
              ${Number(netCalculated).toLocaleString()}
            </span>
          </div>
        </div>
        {/* Card 2: Salary Components */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Salary Components
                </h3>
                <p className="text-[11px] text-slate-400">Allowances and standard deductions</p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {components.length} items
              </span>
            </div>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {components.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  {canManageSalary
                    ? 'No components added yet. Use "+ Component" above.'
                    : 'Standard allowances apply.'}
                </div>
              ) : (
               components.map((c) => (
  <div
    key={c.salaryComponentId}
    className="pt-2 flex items-center justify-between"
  >
    <span className="text-slate-700 font-medium">
      {c.componentName}
    </span>
    <div className="flex items-center gap-3">
      <span
        className={`font-mono font-semibold ${
          c.componentType === 'Deduction'
            ? 'text-rose-600'
            : 'text-slate-900'
        }`}
      >
        {c.componentType === 'Deduction' ? '-' : '+'}$
        {Number(c.amount).toLocaleString()}
      </span>
     {canManageSalary && (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => handleEditComponent(c)}
      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
    >
      Edit
    </button>
    <button
      type="button"
      onClick={async () => {
        if (!window.confirm(`Delete ${c.componentName}?`)) return;
        try {
          await salaryApi.deleteComponent(c.salaryComponentId);
          success('Salary component deleted.');
          loadSalaryData();
        } catch (err: any) {
          toastError(
            err.message || 'Failed to delete salary component.',
            'Error'
          );
        }
      }}
      className="text-rose-600 hover:text-rose-800 text-xs font-medium"
    >
      Delete
    </button>
  </div>
)}
    </div>
  </div>
))
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Allowances: +${totalEarnings.toLocaleString()}</span>
            <span>Total Deductions: -${totalDeductions.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Salary Revision History matching Wireframe 8/9 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Salary Revision History</h3>
            <p className="text-xs text-slate-500">Audit trail of compensation revisions (immutable records)</p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-400" />
        </div>
        {revisions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No salary revisions on record for this employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4">Previous Salary</th>
                  <th className="py-3 px-4">Revised Salary</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revisions.map((r) => (
                  <tr key={r.salaryRevisionId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {r.revisionDate ? new Date(r.revisionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      ${Number(r.previousSalary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      ${Number(r.revisedSalary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{r.reason || 'Appraisal'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Row: Approved Bonus & Overtime Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approved Bonus matching Wireframe 8/9 */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bonuses</h3>
              <p className="text-xs text-slate-500">Recorded bonuses for active period</p>
            </div>
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          {bonuses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No bonuses recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Bonus Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bonuses.map((b) => (
                    <tr key={b.bonusId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-600">
                        {b.bonusDate ? new Date(b.bonusDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{b.bonusType}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${Number(b.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{b.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Overtime Requests matching Wireframe 8/9 */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Overtime Requests</h3>
              <p className="text-xs text-slate-500">Extra hours and approval status</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          {overtimes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No overtime requests submitted.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    {canManageSalary && <th className="py-3 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overtimes.map((ot) => (
                    <tr key={ot.overtimeId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-slate-600">
                        {ot.overtimeDate ? new Date(ot.overtimeDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{ot.hours} hrs</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${Number(ot.amount || ot.hours * ot.rate).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ot.status || 'Pending'} />
                      </td>
                      {canManageSalary && (
                        <td className="py-3 px-4 text-right">
                          {(ot.status || '').toLowerCase() === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleApproveOvertime(ot.overtimeId)}
                                className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Approve overtime"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRejectOvertime(ot.overtimeId)}
                                className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Reject overtime"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Admin View Only: Payroll Generation Runs Table */}
      {canManageSalary && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Payroll Runs</h3>
              <p className="text-xs text-slate-500">Generated batches ready for payslip creation</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPayrollModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Generate Payroll
            </Button>
          </div>
          {payrolls.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No payroll runs generated yet. Click "Generate Payroll" to run a monthly payroll batch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Payroll ID</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Generated At</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((pr) => (
                    <tr key={pr.payrollId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {pr.payrollId.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Month {pr.payrollMonth} / {pr.payrollYear}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {pr.generatedAt ? new Date(pr.generatedAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={pr.status || 'Generated'} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(pr.status || '').toLowerCase() === 'generated' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleGeneratePayslip(pr.payrollId)}
                          >
                            Finalize & Create Payslips
                          </Button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Payslips Table matching Wireframe 8/9 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Issued Payslips</h3>
            <p className="text-xs text-slate-500">Statements of earnings, deductions, and net pay</p>
          </div>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
        {payslips.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No payslips issued yet. Payslips appear once monthly payroll is finalized.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Payslip Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">Components</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Bonus</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Pay</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map((ps) => (
                  <tr key={ps.payslipId} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {ps.payslipNumber || `PS-${ps.payslipId.slice(0, 6)}`}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ps.payslipDate ? new Date(ps.payslipDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ${Number(ps.basicSalary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ${Number(ps.totalComponents).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ${Number(ps.overtimeAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
  ${Number(ps.totalBonus || 0).toLocaleString()}
</td>
<td className="py-3 px-4 font-mono text-rose-600">
  -${Number(ps.totalDeductions || 0).toLocaleString()}
</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                      ${Number(ps.netSalary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayslip(ps);
                          setIsViewPayslipOpen(true);
                        }}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="View payslip statement"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* OVERTIME REQUEST MODAL */}
      <Modal
        isOpen={isOvertimeModalOpen}
        onClose={() => setIsOvertimeModalOpen(false)}
        title="Submit Overtime Request"
        subtitle="Request extra hours compensation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsOvertimeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitOvertime} isLoading={isSubmitting}>
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitOvertime} className="space-y-4">
          <Input
            label="Overtime Date"
            type="date"
            value={otDate}
            onChange={(e) => setOtDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hours Worked"
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={otHours}
              onChange={(e) => setOtHours(e.target.value)}
              required
            />
            <Input
              label="Hourly Rate ($)"
              type="number"
              min="1"
              value={otRate}
              onChange={(e) => setOtRate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason / Project Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={otReason}
              onChange={(e) => setOtReason(e.target.value)}
              placeholder="e.g. Critical release deployment support..."
              required
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </form>
      </Modal>
      {/* SET / UPDATE SALARY MODAL */}
      <Modal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        title="Set Base Salary"
        subtitle="Configuring base compensation for employee"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsSalaryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSalary} isLoading={isSubmitting}>
              Save Salary
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSalary} className="space-y-4">
          <Input
            label="Annual / Monthly Base Salary ($)"
            type="number"
            value={baseSalaryInput}
            onChange={(e) => setBaseSalaryInput(e.target.value)}
            required
          />
          <Input
            label="Effective From Date"
            type="date"
            value={effectiveFromInput}
            onChange={(e) => setEffectiveFromInput(e.target.value)}
            required
          />
        </form>
      </Modal>
  {/* ADD SALARY COMPONENT MODAL */}
  <Modal
    isOpen={isComponentModalOpen}
    onClose={() => setIsComponentModalOpen(false)}
    title="Add Salary Component"
    subtitle="Add allowance or statutory deduction"
    footer={
      <>
        <Button variant="outline" size="sm" onClick={() => setIsComponentModalOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleAddComponent} isLoading={isSubmitting}>
          Add Component
        </Button>
      </>
    }
  >
    <form onSubmit={handleAddComponent} className="space-y-4">
      <Input
        label="Component Name"
        value={compName}
        onChange={(e) => setCompName(e.target.value)}
        placeholder="e.g. Housing Allowance, Medical Aid"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount ($)"
          type="number"
          min="0"
          value={compAmount}
          onChange={(e) => setCompAmount(e.target.value)}
          required
        />
        <Select
          label="Component Type"
          value={compType}
          onChange={(e) => setCompType(e.target.value as 'Earning' | 'Deduction')}
          options={[
            { value: 'Earning', label: 'Earning (+)' },
            { value: 'Deduction', label: 'Deduction (-)' },
          ]}
          required
        />
      </div>
    </form>
  </Modal>

  {/* EDIT SALARY COMPONENT MODAL */}
  <Modal
    isOpen={isEditComponentModalOpen}
    onClose={() => {
      setIsEditComponentModalOpen(false);
      setEditingComponent(null);
    }}
    title="Edit Salary Component"
    subtitle="Update allowance or deduction"
    footer={
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsEditComponentModalOpen(false);
            setEditingComponent(null);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleUpdateComponent}
          isLoading={isSubmitting}
        >
          Update Component
        </Button>
      </>
    }
  >
    <form onSubmit={handleUpdateComponent} className="space-y-4">
      <Input
        label="Component Name"
        value={compName}
        onChange={(e) => setCompName(e.target.value)}
        placeholder="e.g. Housing Allowance"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount ($)"
          type="number"
          min="0"
          value={compAmount}
          onChange={(e) => setCompAmount(e.target.value)}
          required
        />
        <Select
          label="Component Type"
          value={compType}
          onChange={(e) => setCompType(e.target.value as 'Earning' | 'Deduction')}
          options={[
            { value: 'Earning', label: 'Earning (+)' },
            { value: 'Deduction', label: 'Deduction (-)' },
          ]}
          required
        />
      </div>
    </form>
  </Modal>
      {/* REVISE SALARY MODAL */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Create Salary Revision"
        subtitle="Permanent and audited change in base salary (FR-SAL-007)"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateRevision} isLoading={isSubmitting}>
              Apply Revision
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRevision} className="space-y-4">
          <div className="p-3 bg-slate-50 border rounded-lg text-xs">
            <span className="text-slate-500">Current Base Salary:</span>{' '}
            <strong className="text-slate-900 font-mono">${Number(currentBase).toLocaleString()}</strong>
          </div>
          <Input
            label="New Revised Base Salary ($)"
            type="number"
            value={revisedAmount}
            onChange={(e) => setRevisedAmount(e.target.value)}
            required
          />
          <Input
            label="Revision Effective Date"
            type="date"
            value={revDate}
            onChange={(e) => setRevDate(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason / Appraisal Note
            </label>
            <textarea
              rows={2}
              value={revReason}
              onChange={(e) => setRevReason(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </form>
      </Modal>
      {/* ADD BONUS MODAL */}
      <Modal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        title="Add Bonus Entry"
        subtitle="Award performance or festive bonus"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBonusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddBonus} isLoading={isSubmitting}>
              Save Bonus
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddBonus} className="space-y-4">
          <Input
            label="Bonus Type"
            value={bonusType}
            onChange={(e) => setBonusType(e.target.value)}
            placeholder="e.g. Performance Bonus, Annual Bonus"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount ($)"
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              required
            />
            <Input
              label="Bonus Date"
              type="date"
              value={bonusDate}
              onChange={(e) => setBonusDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason</label>
            <textarea
              rows={2}
              value={bonusReason}
              onChange={(e) => setBonusReason(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </form>
      </Modal>
      {/* GENERATE PAYROLL MODAL */}
      <Modal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        title="Generate Monthly Payroll"
        subtitle="Processes basic salaries, components, and approved bonuses"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsPayrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleGeneratePayroll} isLoading={isSubmitting}>
              Run Payroll
            </Button>
          </>
        }
      >
        <form onSubmit={handleGeneratePayroll} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payroll Month"
              value={String(payrollMonth)}
              onChange={(e) => setPayrollMonth(Number(e.target.value))}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: new Date(2026, i, 1).toLocaleString('default', { month: 'long' }),
              }))}
            />
            <Input
              label="Payroll Year"
              type="number"
              value={payrollYear}
              onChange={(e) => setPayrollYear(Number(e.target.value))}
              required
            />
          </div>
          <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-600">
            Generates draft payroll batch in <strong>Generated</strong> status. After verification, HR can finalize it and publish employee payslips.
          </div>
        </form>
      </Modal>
      {/* VIEW PAYSLIP MODAL */}
      <Modal
        isOpen={isViewPayslipOpen}
        onClose={() => setIsViewPayslipOpen(false)}
        title="Official Payslip Statement"
        subtitle={selectedPayslip?.payslipNumber || 'Payslip'}
        maxWidth="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsViewPayslipOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedPayslip && (
          <div className="space-y-4 p-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-base text-slate-900">EMS Corporation Ltd.</h4>
                <p className="text-[11px] text-slate-400">Statement of Compensation & Earnings</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-800">
                  {selectedPayslip.payslipNumber}
                </span>
                <p className="text-[11px] text-slate-500">
                  Date: {selectedPayslip.payslipDate ? new Date(selectedPayslip.payslipDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-400 font-semibold mb-1">EARNINGS</div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Basic Salary</span>
                  <span className="font-mono font-semibold">${Number(selectedPayslip.basicSalary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Components</span>
                  <span className="font-mono font-semibold">+${Number(selectedPayslip.totalComponents).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Overtime</span>
                  <span className="font-mono font-semibold">+${Number(selectedPayslip.overtimeAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Bonuses</span>
                  <span className="font-mono font-semibold">+${Number(selectedPayslip.totalBonus || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">DEDUCTIONS</div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>Total Deductions</span>
                    <span className="font-mono font-semibold text-rose-600">-${Number(selectedPayslip.totalDeductions).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">NET DISBURSED</div>
                  <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                    ${Number(selectedPayslip.netSalary).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};