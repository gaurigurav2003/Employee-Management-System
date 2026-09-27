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
import {
  CalendarCheck,
  Clock,
  Check,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [leaves, setLeaves] = useState<LeaveResponseDto[]>([]);
  const [reviewLeaves, setReviewLeaves] = useState<LeaveResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [reason, setReason] = useState('');

  const canReview = isAdmin || isHR || isManager;

  const loadData = async () => {
    setIsLoading(true);

    try {
      if (canReview) {
        // HR / Manager / Admin can see all employee leave requests
        const allLeaves = await leaveApi.getAll().catch(() => []);

        setLeaves(Array.isArray(allLeaves) ? allLeaves : []);

        setReviewLeaves(
          Array.isArray(allLeaves)
            ? allLeaves.filter(
                (l) => (l.status || '').toLowerCase() === 'pending'
              )
            : []
        );
      } else if (user?.employeeId) {
        // Employee sees only their own leave history
        const myLeaves = await leaveApi
          .getHistoryByEmployeeId(user.employeeId)
          .catch(() => []);

        setLeaves(Array.isArray(myLeaves) ? myLeaves : []);
        setReviewLeaves([]);
      } else {
        setLeaves([]);
        setReviewLeaves([]);
      }
    } catch {
      setLeaves([]);
      setReviewLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.employeeId) {
      toastError('Employee profile not loaded. Please sign in again.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toastError(
        'Start date cannot be after end date (BR-LEV-001).',
        'Validation Error'
      );
      return;
    }

    if (!reason.trim()) {
      toastError('Reason is required.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);

    try {
      const dto: LeaveCreateDto = {
        employeeId: user.employeeId,
        leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim(),
      };

      await leaveApi.apply(dto);

      success(
        'Leave application submitted successfully. Status is Pending.'
      );

      setReason('');
      loadData();
    } catch (err: any) {
      toastError(
        err.message || 'Failed to submit leave application.',
        'Error',
        err.errors
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (
    leaveId: string,
    applicantEmployeeId: string
  ) => {
    if (!user) return;

    if (
      applicantEmployeeId === user.employeeId &&
      user.employeeId
    ) {
      toastError(
        'A user cannot approve their own request (BR-GEN-005).',
        'Permission Denied'
      );
      return;
    }

    setActionId(leaveId);

    try {
      await leaveApi.approve(leaveId, user.userId);

      success('Leave request approved.');
      loadData();
    } catch (err: any) {
      toastError(
        err.message || 'Failed to approve leave.',
        'Error'
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (
    leaveId: string,
    applicantEmployeeId: string
  ) => {
    if (!user) return;

    if (
      applicantEmployeeId === user.employeeId &&
      user.employeeId
    ) {
      toastError(
        'A user cannot reject their own request (BR-GEN-005).',
        'Permission Denied'
      );
      return;
    }

    setActionId(leaveId);

    try {
      await leaveApi.reject(leaveId, user.userId);

      success('Leave request rejected.');
      loadData();
    } catch (err: any) {
      toastError(
        err.message || 'Failed to reject leave.',
        'Error'
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          WORKSPACE / LEAVES
        </span>

        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Leave Management
        </h2>

        <p className="text-xs text-slate-500 mt-0.5">
          Request time off and track approval status.
        </p>
      </div>

      {/* Application Form + Leave Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Apply for leave
            </h3>

            <p className="text-xs text-slate-500">
              Submit your leave dates for manager and HR review
            </p>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <Select
                label="Leave Type"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                options={[
                  {
                    value: 'Annual Leave',
                    label: 'Annual Leave (Paid)',
                  },
                  {
                    value: 'Sick Leave',
                    label: 'Sick Leave',
                  },
                  {
                    value: 'Casual Leave',
                    label: 'Casual Leave',
                  },
                  {
                    value: 'Maternity/Paternity',
                    label: 'Maternity / Paternity Leave',
                  },
                  {
                    value: 'Unpaid Leave',
                    label: 'Unpaid Leave',
                  },
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

        {/* Leave Balance */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Leave Balance
            </h3>

            <p className="text-xs text-slate-500">
              Allocated annual allowance
            </p>

            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
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
                  <span className="text-3xl font-extrabold text-slate-900">
                    18
                  </span>

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

                <span className="font-semibold text-slate-900">
                  18 / 24 days
                </span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Sick Leave
                </span>

                <span className="font-semibold text-slate-900">
                  10 / 12 days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Casual Leave
                </span>

                <span className="font-semibold text-slate-900">
                  04 / 06 days
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Service: LeaveService (PostgreSQL)
          </div>
        </div>
      </div>

      {/* Team Requests Review */}
      {canReview && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Review Team Leave Requests
              </h3>

              <p className="text-xs text-slate-500">
                Authorize or reject pending employee leave submissions
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Pending:{' '}
              {
                reviewLeaves.filter(
                  (r) =>
                    r.status?.toLowerCase() === 'pending'
                ).length
              }
            </span>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Checking pending leave requests..." />
          ) : reviewLeaves.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No leave requests awaiting your review.
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
                    <th className="py-3 px-4 text-right">
                      Decision
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {reviewLeaves.map((req) => (
                    <tr
                      key={req.leaveId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {req.employeeId.slice(0, 8)}...
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.leaveType}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {req.startDate?.slice(0, 10)} to{' '}
                        {req.endDate?.slice(0, 10)}
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {req.reason}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge
                          status={req.status || 'Pending'}
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(req.status || '').toLowerCase() ===
                        'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                handleApprove(
                                  req.leaveId,
                                  req.employeeId
                                )
                              }
                              disabled={actionId === req.leaveId}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  req.leaveId,
                                  req.employeeId
                                )
                              }
                              disabled={actionId === req.leaveId}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-medium text-xs transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Decided
                          </span>
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

      {/* Leave History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Your Leave History
          </h3>

          <p className="text-xs text-slate-500">
            Record of your past and upcoming leave applications
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading leave history..." />
        ) : leaves.length === 0 ? (
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
                {leaves.map((l) => (
                  <tr
                    key={l.leaveId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {l.leaveType}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {l.startDate?.slice(0, 10)} →{' '}
                      {l.endDate?.slice(0, 10)}
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-sm truncate">
                      {l.reason}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {l.appliedAt
                        ? new Date(
                            l.appliedAt
                          ).toLocaleDateString()
                        : 'Recent'}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge
                        status={l.status || 'Pending'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};