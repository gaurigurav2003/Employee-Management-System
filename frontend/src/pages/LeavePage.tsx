import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { leaveApi } from '../api/leaveApi';
import { LeaveResponseDto, LeaveCreateDto } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { employeeApi } from '../api/employeeApi';
import {
  CalendarCheck,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [myLeaves, setMyLeaves] = useState<LeaveResponseDto[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<LeaveResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'management'>('my');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');

  const canReview = isAdmin || isHR || isManager;

  const loadData = async () => {
    setIsLoading(true);

    try {
      let currentEmpId = user?.employeeId;
      if (!currentEmpId && user?.userId) {
        try {
          const me = await employeeApi.getMe();
          if (me?.employeeId) currentEmpId = me.employeeId;
        } catch {
          try {
            const me = await employeeApi.getByUserId(user.userId);
            if (me?.employeeId) currentEmpId = me.employeeId;
          } catch {}
        }
      }

      // 1. Always load own leave history if employeeId exists
      if (currentEmpId) {
        const myData = await leaveApi
          .getHistoryByEmployeeId(currentEmpId)
          .catch(() => []);
        setMyLeaves(Array.isArray(myData) ? myData : []);
      } else {
        setMyLeaves([]);
      }

      // 2. Load management review queue if authorized
      if (canReview) {
        const all = await leaveApi.getAll().catch(() => []);
        setTeamLeaves(Array.isArray(all) ? all : []);
      }
    } catch {
      setMyLeaves([]);
      setTeamLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    let empId = user?.employeeId;
    if (!empId && user?.userId) {
      try {
        const me = await employeeApi.getMe();
        if (me?.employeeId) empId = me.employeeId;
      } catch {
        try {
          const me = await employeeApi.getByUserId(user.userId);
          if (me?.employeeId) empId = me.employeeId;
        } catch {}
      }
    }

    if (!empId) {
      toastError('Employee profile not loaded. Please ensure you are logged in with an active employee account.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toastError('Start date cannot be after end date (BR-LEV-001).', 'Validation Error');
      return;
    }

    if (!reason.trim()) {
      toastError('Reason is required.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);

    try {
      const dto: LeaveCreateDto = {
        employeeId: empId,
        leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim(),
      };

      await leaveApi.apply(dto);

      success('Leave application submitted successfully. Status is Pending.');
      setReason('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit leave application.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (leaveId: string, applicantEmployeeId: string) => {
    if (!user) return;

    if (applicantEmployeeId === user.employeeId) {
      toastError('A user cannot approve their own request (BR-GEN-005).', 'Permission Denied');
      return;
    }

    setActionId(leaveId);

    try {
      await leaveApi.approve(leaveId, user.employeeId || user.userId);
      success('Leave request approved.');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to approve leave.', 'Error');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (leaveId: string, applicantEmployeeId: string) => {
    if (!user) return;

    if (applicantEmployeeId === user.employeeId) {
      toastError('A user cannot reject their own request (BR-GEN-005).', 'Permission Denied');
      return;
    }

    setActionId(leaveId);

    try {
      await leaveApi.reject(leaveId, user.employeeId || user.userId);
      success('Leave request rejected.');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to reject leave.', 'Error');
    } finally {
      setActionId(null);
    }
  };

  const pendingReviewCount = teamLeaves.filter(
    (r) => (r.status || '').toLowerCase() === 'pending'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / LEAVES
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Leave Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Request time off and track approval status.
          </p>
        </div>

        {/* Tab switcher for Management */}
        {canReview && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Leaves
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'management'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Leave Approval Queue</span>
              {pendingReviewCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── TAB: MY LEAVES (Self-Service for all roles) ─── */}
      {activeTab === 'my' && (
        <>
          {/* Application Form + Leave Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Application Form */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Apply for leave</h3>
                <p className="text-xs text-slate-500">
                  Submit your leave dates for review
                </p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <Select
                    label="Leave Type"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    options={[
                      { value: 'Annual Leave', label: 'Annual Leave (Paid)' },
                      { value: 'Sick Leave', label: 'Sick Leave' },
                      { value: 'Casual Leave', label: 'Casual Leave' },
                      { value: 'Maternity/Paternity', label: 'Maternity / Paternity Leave' },
                      { value: 'Unpaid Leave', label: 'Unpaid Leave' },
                    ]}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Details about your leave request (max 500 characters)..."
                    maxLength={500}
                    required
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                  >
                    Submit request
                  </Button>
                </div>
              </form>
            </div>

            {/* Leave Balance Card */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Leave Balance</h3>
                <p className="text-xs text-slate-500">Allocated annual allowance</p>

                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-slate-900"
                        strokeDasharray="75, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-slate-900">18</span>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Days Left
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                      Annual Leave
                    </span>
                    <span className="font-semibold text-slate-900">18 / 24 days</span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Sick Leave
                    </span>
                    <span className="font-semibold text-slate-900">10 / 12 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      Casual Leave
                    </span>
                    <span className="font-semibold text-slate-900">04 / 06 days</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-mono">
                Service: LeaveService
              </div>
            </div>
          </div>

          {/* Personal Leave History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Your Personal Leave History</h3>
              <p className="text-xs text-slate-500">
                Past and upcoming leave requests submitted by your account
              </p>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Loading your leave history..." />
            ) : myLeaves.length === 0 ? (
              <EmptyState
                title="No leave requests yet"
                description="Use the form above to submit your first leave application."
                icon={<CalendarCheck className="w-6 h-6" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {myLeaves.map((l) => (
                      <tr key={l.leaveId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{l.leaveType}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {l.startDate?.slice(0, 10)} → {l.endDate?.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-sm truncate">{l.reason}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {l.appliedAt ? new Date(l.appliedAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={l.status || 'Pending'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── TAB: LEAVE APPROVAL QUEUE (Management only) ─── */}
      {activeTab === 'management' && canReview && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Team Leave Requests Review
              </h3>
              <p className="text-xs text-slate-500">
                Approve or reject employee leave submissions (self-approval is disabled)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Pending: {pendingReviewCount}
            </span>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Checking team leave requests..." />
          ) : teamLeaves.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No leave requests in the queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {teamLeaves.map((req) => {
                    const isSelf = req.employeeId === user?.employeeId;
                    const isPending = (req.status || '').toLowerCase() === 'pending';

                    return (
                      <tr key={req.leaveId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          {req.employeeId?.slice(0, 8)}...
                          {isSelf && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{req.leaveType}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {req.startDate?.slice(0, 10)} to {req.endDate?.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={req.status || 'Pending'} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPending ? (
                            isSelf ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                                <ShieldAlert className="w-3 h-3" />
                                Self - Cannot Approve
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApprove(req.leaveId, req.employeeId)}
                                  disabled={actionId === req.leaveId}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-xs transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(req.leaveId, req.employeeId)}
                                  disabled={actionId === req.leaveId}
                                  className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-medium text-xs transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-slate-400 text-[11px]">Decided</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};