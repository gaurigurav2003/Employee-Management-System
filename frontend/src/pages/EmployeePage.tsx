import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { employeeApi } from '../api/employeeApi';
import { departmentApi } from '../api/departmentApi';
import {
  EmployeeResponseDto,
  EmployeeCreateDto,
  EmployeeUpdateDto,
  DepartmentResponseDto,
} from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AccessDenied } from '../components/common/AccessDenied';
import {
  Search,
  Filter,
  Plus,
  Users,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
} from 'lucide-react';

export const EmployeePage: React.FC = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<EmployeeCreateDto>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfJoining: new Date().toISOString().slice(0, 10),
    departmentId: '',
    role: 'Employee',
    employmentStatus: 'Active',
  });

  const canManage = isAdmin || isHR;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentApi.getAll().catch(() => []),
        canManage || isManager
          ? employeeApi.getAll().catch(() => [])
          : employeeApi.getMe().then((me) => (me ? [me] : [])).catch(() => []),
      ]);

      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setEmployees(Array.isArray(empRes) ? empRes : []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load employees from API Gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Map departmentId to department name
  const deptMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.departmentId, d.departmentName || 'General'));
    return map;
  }, [departments]);

  // Filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();
      const s = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || fullName.includes(s) || email.includes(s) || role.includes(s);
      const matchesDept = !selectedDeptFilter || emp.departmentId === selectedDeptFilter;
      const matchesStatus = !selectedStatusFilter || emp.employmentStatus === selectedStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDeptFilter, selectedStatusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      userId: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfJoining: new Date().toISOString().slice(0, 10),
      departmentId: departments[0]?.departmentId || '',
      role: 'Employee',
      employmentStatus: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.departmentId) {
      toastError('Please fill in all required fields.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeeApi.create(formData as EmployeeCreateDto);
      success('Employee created successfully.');
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to create employee.', 'Server Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: EmployeeResponseDto) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.slice(0, 10) : new Date().toISOString().slice(0, 10),
      departmentId: emp.departmentId || '',
      role: emp.role || 'Employee',
      employmentStatus: emp.employmentStatus || 'Active',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await employeeApi.update(selectedEmployee.employeeId, formData as EmployeeUpdateDto);
      success('Employee updated successfully.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update employee.', 'Server Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (emp: EmployeeResponseDto) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await employeeApi.delete(selectedEmployee.employeeId);
      success('Employee deleted successfully.');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete employee.', 'Server Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenView = (emp: EmployeeResponseDto) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  // If user is basic employee without view rights
  if (!canManage && !isManager && employees.length === 0 && !isLoading) {
    return (
      <AccessDenied message="You do not have administrative authority to browse the full employee directory." />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Screen Header matching Wireframe 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / EMPLOYEES
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Employees</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee records, roles, and employment status.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add employee
          </Button>
        )}
      </div>

      {/* Search and Filters toolbar matching Wireframe 4 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table matching Wireframe 4 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching employee directory from EmployeeService..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              searchTerm || selectedDeptFilter || selectedStatusFilter
                ? 'No records match your active search filters.'
                : 'No employees have been added to the system yet.'
            }
            icon={<Users className="w-6 h-6" />}
            actionText={canManage ? 'Add first employee' : undefined}
            onAction={canManage ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((emp) => {
                  const empIdShort = emp.employeeId?.slice(0, 8).toUpperCase() || 'EMP-XXXX';
                  const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase() || 'EM';
                  const deptName = deptMap.get(emp.departmentId) || 'General';

                  return (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {empIdShort}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {deptName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {emp.role || 'Employee'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={emp.employmentStatus || 'Active'} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(emp)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(emp)}
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleOpenDelete(emp)}
                                className="px-2 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded text-xs transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer / count */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
          <span className="font-mono text-[11px]">Route: /api/v1/employees</span>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL matching EmployeeCreateDto */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Create an employee profile record in EmployeeService"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateEmployee} isLoading={isSubmitting}>
              Create Employee
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateEmployee} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              options={departments.map((d) => ({
                value: d.departmentId,
                label: d.departmentName || d.departmentId,
              }))}
              required
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'Manager', label: 'Manager' },
                { value: 'HR', label: 'HR' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Support', label: 'Support Staff' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Joining"
              type="date"
              value={formData.dateOfJoining}
              onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              required
            />
            <Select
              label="Employment Status"
              value={formData.employmentStatus}
              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              required
            />
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        subtitle={`Updating record for ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateEmployee} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateEmployee} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              options={departments.map((d) => ({
                value: d.departmentId,
                label: d.departmentName || d.departmentId,
              }))}
              required
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'Manager', label: 'Manager' },
                { value: 'HR', label: 'HR' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Support', label: 'Support Staff' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date of Joining"
              type="date"
              value={formData.dateOfJoining}
              onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
              required
            />
            <Select
              label="Employment Status"
              value={formData.employmentStatus}
              onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              required
            />
          </div>
        </form>
      </Modal>

      {/* VIEW EMPLOYEE MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Profile Details"
        subtitle={selectedEmployee?.employeeId}
        maxWidth="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                {`${selectedEmployee.firstName?.[0] || ''}${selectedEmployee.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h4>
                <p className="text-xs text-slate-500">{selectedEmployee.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">DEPARTMENT</span>
                <span className="font-semibold text-slate-800">
                  {deptMap.get(selectedEmployee.departmentId) || 'General'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">ROLE</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.role || 'Employee'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">PHONE</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">STATUS</span>
                <StatusBadge status={selectedEmployee.employmentStatus || 'Active'} />
              </div>
              <div className="p-3 rounded-lg border border-slate-200 col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">JOINED DATE</span>
                <span className="font-semibold text-slate-800">
                  {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
        title="Delete Employee Record"
        message={`Are you sure you want to delete employee record ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? This action will permanently remove the record from EmployeeService.`}
        confirmText="Delete Employee"
        isDangerous
        isLoading={isSubmitting}
      />
    </div>
  );
};
