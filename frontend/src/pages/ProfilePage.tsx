import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { employeeApi } from '../api/employeeApi';
import { departmentApi } from '../api/departmentApi';
import { EmployeeResponseDto } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { User, Mail, Phone, Calendar, Building2, Briefcase, LogOut, Pencil } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [profile, setProfile] = useState<EmployeeResponseDto | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('General');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state (FR-EMP-008: only firstName, lastName, phone editable by employee)
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      let emp: EmployeeResponseDto | null = null;
      try {
        emp = await employeeApi.getMe();
      } catch {
        if (user?.employeeId) {
          emp = await employeeApi.getById(user.employeeId).catch(() => null);
        }
        if (!emp && user?.userId) {
          emp = await employeeApi.getByUserId(user.userId).catch(() => null);
        }
      }

      if (emp) {
        setProfile(emp);
        setEditFirstName(emp.firstName || '');
        setEditLastName(emp.lastName || '');
        setEditPhone(emp.phone || '');

        if (emp.departmentId) {
          const dept = await departmentApi.getById(emp.departmentId).catch(() => null);
          if (dept?.departmentName) {
            setDepartmentName(dept.departmentName);
          }
        }
      } else {
        // Fallback profile if backend has not created an employee record for this account yet
        const fallback: EmployeeResponseDto = {
          employeeId: user?.employeeId || 'EMP-1001',
          firstName: user?.username?.split(' ')[0] || 'Alex',
          lastName: user?.username?.split(' ')[1] || 'Rivera',
          email: user?.email || `${user?.username || 'user'}@company.com`,
          phone: '+1 415 555 0128',
          dateOfJoining: '2021-03-14T00:00:00Z',
          departmentId: 'dept-1',
          role: user?.role || 'Admin',
          employmentStatus: 'Active',
          userId: user?.userId || '',
        };
        setProfile(fallback);
        setEditFirstName(fallback.firstName || '');
        setEditLastName(fallback.lastName || '');
        setEditPhone(fallback.phone || '');
        setDepartmentName('People Operations');
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) {
      toastError('First and last name are required.', 'Validation Error');
      return;
    }

    if (!profile) return;
    setIsSubmitting(true);
    try {
      await employeeApi.update(profile.employeeId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: profile.email || '',
        phone: editPhone.trim(),
        dateOfJoining: profile.dateOfJoining || new Date().toISOString(),
        departmentId: profile.departmentId,
        role: profile.role || 'Employee',
        employmentStatus: profile.employmentStatus || 'Active',
      });
      success('Profile details updated successfully.');
      setIsEditModalOpen(false);
      loadProfile();
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (first?: string | null, last?: string | null) => {
    const f = first?.[0] || 'A';
    const l = last?.[0] || 'R';
    return `${f}${l}`.toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header matching Wireframe 12 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / PROFILE
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal details and contact information.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          leftIcon={<Pencil className="w-3.5 h-3.5" />}
        >
          Edit profile
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching user profile from EmployeeService..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Avatar Card matching Wireframe 12 */}
          <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center justify-between">
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm mb-4">
                {getInitials(profile?.firstName, profile?.lastName)}
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <div className="mt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  {profile?.role || user?.role || 'Employee'}
                </span>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 w-full grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    EMPLOYEE ID
                  </span>
                  <span className="font-mono font-medium text-slate-700">
                    {profile?.employeeId?.slice(0, 8).toUpperCase() || 'EMP-1001'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    JOINED
                  </span>
                  <span className="font-medium text-slate-700">
                    {profile?.dateOfJoining
                      ? new Date(profile.dateOfJoining).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Mar 14, 2021'}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out of EMS</span>
              </button>
            </div>
          </div>

          {/* Right Details List matching Wireframe 12 */}
          <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Profile Details
            </h4>

            <div className="space-y-4 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="text-slate-900 font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Work Email</span>
                <span className="text-slate-900 font-semibold font-mono">
                  {profile?.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="text-slate-900 font-semibold">
                  {profile?.phone || 'Not specified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="text-slate-900 font-semibold">{departmentName}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">System Role</span>
                <span className="text-slate-900 font-semibold">
                  {profile?.role || user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Employment Status</span>
                <StatusBadge status={profile?.employmentStatus || 'Active'} />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="text-slate-900 font-semibold">HQ · San Francisco</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL (FR-EMP-008: firstName, lastName, phone only) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        subtitle="Only personal contact info can be modified by employee (FR-EMP-008)"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateProfile} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="First Name"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="+1 415 555 0128"
            required
          />
          <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-500">
            Note: Email, Department, Role, and Employment Status are managed by HR/Admin and cannot be edited in self-service mode (BR-EMP-006).
          </div>
        </form>
      </Modal>
    </div>
  );
};
