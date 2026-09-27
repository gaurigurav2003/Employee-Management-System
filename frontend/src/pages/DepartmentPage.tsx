import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { departmentApi } from '../api/departmentApi';
import { employeeApi } from '../api/employeeApi';
import { DepartmentResponseDto, EmployeeResponseDto, DepartmentCreateDto, DepartmentUpdateDto } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Search, Plus, Building2, Eye, Pencil, Trash2, Users } from 'lucide-react';

export const DepartmentPage: React.FC = () => {
  const { isAdmin, isHR } = useAuth();
  const { success, error: toastError } = useToast();

  const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');

  const canManage = isAdmin || isHR;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentApi.getAll(),
        employeeApi.getAll().catch(() => []),
      ]);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setEmployees(Array.isArray(empRes) ? empRes : []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load departments from DepartmentService.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute headcount per department
  const employeeCountByDept = useMemo(() => {
    const counts = new Map<string, number>();
    employees.forEach((emp) => {
      if (emp.departmentId) {
        counts.set(emp.departmentId, (counts.get(emp.departmentId) || 0) + 1);
      }
    });
    return counts;
  }, [employees]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const name = (d.departmentName || '').toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const s = searchTerm.toLowerCase();
      return !searchTerm || name.includes(s) || desc.includes(s);
    });
  }, [departments, searchTerm]);

  const handleOpenAdd = () => {
    setDepartmentName('');
    setDescription('');
    setIsAddModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim()) {
      toastError('Department name is required.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await departmentApi.create({
        departmentName: departmentName.trim(),
        description: description.trim(),
      });
      success('Department created successfully.');
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to create department.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (dept: DepartmentResponseDto) => {
    setSelectedDept(dept);
    setDepartmentName(dept.departmentName || '');
    setDescription(dept.description || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      await departmentApi.update(selectedDept.departmentId, {
        departmentName: departmentName.trim(),
        description: description.trim(),
      });
      success('Department updated successfully.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update department.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (dept: DepartmentResponseDto) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDept) return;

    // Rule BR-DEP-002: cannot delete if employees assigned
    const assignedCount = employeeCountByDept.get(selectedDept.departmentId) || 0;
    if (assignedCount > 0) {
      toastError(
        `Cannot delete department: ${assignedCount} active employees are currently assigned to this department. Reassign them first.`,
        'Constraint Violation (BR-DEP-002)'
      );
      setIsDeleteModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await departmentApi.delete(selectedDept.departmentId);
      success('Department removed successfully.');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete department.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Wireframe 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / DEPARTMENTS
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize teams, department structure, and headcount.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
          >
            Add Department
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: {departments.length}
        </div>
      </div>

      {/* Table matching Wireframe 5 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Querying DepartmentService..." />
        ) : filteredDepartments.length === 0 ? (
          <EmptyState
            title="No departments found"
            description="No department matches your current search."
            icon={<Building2 className="w-6 h-6" />}
            actionText={canManage ? 'Add Department' : undefined}
            onAction={canManage ? handleOpenAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Dept ID</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDepartments.map((dept) => {
                  const deptIdShort = dept.departmentId?.slice(0, 8).toUpperCase() || 'DEP-XX';
                  const count = employeeCountByDept.get(dept.departmentId) || 0;

                  return (
                    <tr key={dept.departmentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {deptIdShort}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {dept.departmentName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                        {dept.description || 'No description provided.'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          <Users className="w-3 h-3 text-slate-500" />
                          {count} {count === 1 ? 'person' : 'people'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="Active" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedDept(dept);
                              setIsViewModalOpen(true);
                            }}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
                          >
                            View
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(dept)}
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleOpenDelete(dept)}
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
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Department"
        subtitle="Create an organizational unit in DepartmentService"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate} isLoading={isSubmitting}>
              Create Department
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="e.g. Engineering, People Operations"
            required
            autoFocus
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of responsibilities..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Department"
        subtitle={`Updating department ${selectedDept?.departmentName}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdate} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Department Name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Department Overview"
        subtitle={selectedDept?.departmentId}
        maxWidth="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedDept && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-base text-slate-900 mb-1">
                {selectedDept.departmentName}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedDept.description || 'No description entered.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">CURRENT HEADCOUNT</span>
                <span className="font-bold text-slate-800 text-sm">
                  {employeeCountByDept.get(selectedDept.departmentId) || 0} employees
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">STATUS</span>
                <StatusBadge status="Active" />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedDept?.departmentName}"? As per BR-DEP-002, a department cannot be deleted while employees are assigned to it.`}
        confirmText="Delete Department"
        isDangerous
        isLoading={isSubmitting}
      />
    </div>
  );
};
