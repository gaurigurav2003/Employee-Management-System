import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supportApi } from '../api/supportApi';
import { employeeApi } from '../api/employeeApi';
import {
  SupportTicketResponseDto,
  SupportTicketCreateDto,
} from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  LifeBuoy,
  Send,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Check,
  XCircle,
} from 'lucide-react';

const AREA_ROLE_MAPPING: Record<string, string> = {
  HR: 'HR',
  Admin: 'Admin',
  Manager: 'Manager',
  Support: 'Support',
};

const AREA_OPTIONS = [
  { value: 'HR', label: 'HR' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Support', label: 'Support' },
];

export const SupportPage: React.FC = () => {
  const { user, isAdmin, isSupport, isHR, isManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [myTickets, setMyTickets] = useState<SupportTicketResponseDto[]>([]);
  const [teamTickets, setTeamTickets] = useState<SupportTicketResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'management'>('my');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket creation form state
  const [selectedArea, setSelectedArea] = useState('HR');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // View modal state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponseDto | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const canManageTickets = isAdmin || isSupport || isHR || isManager;
  const assignedRoleForArea = AREA_ROLE_MAPPING[selectedArea] || 'HR';

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

      // 1. Load personal tickets for all roles
      if (currentEmpId) {
        const mine = await supportApi.getByEmployeeId(currentEmpId).catch(() => []);
        setMyTickets(Array.isArray(mine) ? mine : []);
      } else {
        setMyTickets([]);
      }

      // 2. Load all tickets queue for management roles
      if (canManageTickets) {
        const all = await supportApi.getAll().catch(() => []);
        setTeamTickets(Array.isArray(all) ? all : []);
      }
    } catch {
      setMyTickets([]);
      setTeamTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
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
      toastError('Employee profile is not loaded. Please make sure you are signed in.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      toastError('Title and description are required.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullTitle = `[${selectedArea}] ${title.trim()}`;
      const dto: SupportTicketCreateDto = {
        employeeId: empId,
        title: fullTitle,
        description: description.trim(),
        priority,
      };

      await supportApi.create(dto);
      success(`Support ticket submitted and routed to ${assignedRoleForArea} team.`);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to create ticket.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await supportApi.update(ticketId, { status: newStatus });
      success(`Ticket status updated to ${newStatus}.`);
      loadData();
    } catch (err: any) {
      toastError(err.message || `Failed to transition ticket to ${newStatus}.`, 'Workflow Conflict');
    }
  };

  // Helper to extract area and assigned role from ticket
  const getTicketMeta = (ticketTitle?: string | null) => {
    const titleStr = ticketTitle || '';
    for (const area of Object.keys(AREA_ROLE_MAPPING)) {
      if (titleStr.startsWith(`[${area}]`)) {
        return {
          area,
          assignedRole: AREA_ROLE_MAPPING[area],
          cleanTitle: titleStr.replace(`[${area}]`, '').trim(),
        };
      }
    }
    return {
      area: 'Support',
      assignedRole: 'Support',
      cleanTitle: titleStr,
    };
  };

  // Status counts for management tab
  const countOpen = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'open').length;
  const countAssigned = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'assigned').length;
  const countInProgress = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'inprogress').length;
  const countResolved = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'resolved').length;
  const countClosed = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'closed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / SUPPORT
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Support Tickets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and track workplace support requests routed by category.
          </p>
        </div>

        {/* Tab switch for support staff / admin / HR / manager */}
        {canManageTickets && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'management'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Ticket Management Queue</span>
              {countOpen > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-mono">
                  {countOpen}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── TAB: MY TICKETS (Self-service for all roles) ─── */}
      {activeTab === 'my' && (
        <>
          {/* Create Ticket Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Create a Support Ticket</h3>
              <p className="text-xs text-slate-500">
                Select an area to automatically route your request to the appropriate team
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Select
                    label="Select Area"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    options={AREA_OPTIONS}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assigned Role
                  </label>
                  <div className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold flex items-center justify-between">
                    <span>{assignedRoleForArea} Team</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold uppercase">
                      Auto-Routed
                    </span>
                  </div>
                </div>

                <div>
                  <Select
                    label="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    options={[
                      { value: 'Low', label: 'Low - General inquiry or minor request' },
                      { value: 'Medium', label: 'Medium - Standard request' },
                      { value: 'High', label: 'High - Urgent / blocking issue' },
                    ]}
                    required
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Ticket Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summary of what you need assistance with..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your request or issue in detail..."
                  required
                  maxLength={2000}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit ticket
                </Button>
              </div>
            </form>
          </div>

          {/* Personal Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your Submitted Tickets</h3>
                <p className="text-xs text-slate-500">Tracking personal requests submitted by you</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {myTickets.length}</span>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Loading your support tickets..." />
            ) : myTickets.length === 0 ? (
              <EmptyState
                title="No support tickets found"
                description="Use the form above to raise your first support ticket."
                icon={<LifeBuoy className="w-6 h-6" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myTickets.map((t) => {
                      const meta = getTicketMeta(t.title);

                      return (
                        <tr key={t.ticketId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {t.ticketId?.slice(0, 8).toUpperCase()}...
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {meta.area}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                              {meta.assignedRole}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{meta.cleanTitle}</div>
                            <div className="text-[11px] text-slate-400 max-w-xs truncate">
                              {t.description}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                t.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={t.status || 'Open'} />
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedTicket(t);
                                setIsViewModalOpen(true);
                              }}
                              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── TAB: TICKET MANAGEMENT QUEUE (Staff only) ─── */}
      {activeTab === 'management' && canManageTickets && (
        <div className="space-y-6">
          {/* Status Breakdown Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
              <span className="text-[11px] font-semibold text-blue-900 block">Open</span>
              <span className="font-bold text-blue-700 font-mono text-lg">{countOpen}</span>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
              <span className="text-[11px] font-semibold text-amber-900 block">Assigned</span>
              <span className="font-bold text-amber-700 font-mono text-lg">{countAssigned}</span>
            </div>
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <span className="text-[11px] font-semibold text-purple-900 block">In Progress</span>
              <span className="font-bold text-purple-700 font-mono text-lg">{countInProgress}</span>
            </div>
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-900 block">Resolved</span>
              <span className="font-bold text-emerald-700 font-mono text-lg">{countResolved}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-700 block">Closed</span>
              <span className="font-bold text-slate-600 font-mono text-lg">{countClosed}</span>
            </div>
          </div>

          {/* Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">All Support Tickets Queue</h3>
                <p className="text-xs text-slate-500">
                  Role-routed workflow: Open → Assigned → In Progress → Resolved → Closed
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {teamTickets.length}</span>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Querying SupportService tickets..." />
            ) : teamTickets.length === 0 ? (
              <EmptyState
                title="No support tickets in queue"
                description="All support requests will appear here for management and resolution."
                icon={<LifeBuoy className="w-6 h-6" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamTickets.map((t) => {
                      const status = (t.status || 'Open').toLowerCase();
                      const meta = getTicketMeta(t.title);

                      return (
                        <tr key={t.ticketId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {t.ticketId?.slice(0, 8).toUpperCase()}...
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {meta.area}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              {meta.assignedRole}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{meta.cleanTitle}</div>
                            <div className="text-[11px] text-slate-400 max-w-xs truncate">
                              {t.description}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                                t.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={t.status || 'Open'} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setIsViewModalOpen(true);
                                }}
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium"
                              >
                                View
                              </button>

                              {(() => {
                                const isRequester = !!user?.employeeId && t.employeeId === user.employeeId;

                                if (isRequester && (status === 'inprogress' || status === 'resolved')) {
                                  return (
                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                      Requester (Cannot {status === 'inprogress' ? 'Resolve' : 'Close'})
                                    </span>
                                  );
                                }

                                return (
                                  <>
                                    {status === 'open' && (
                                      <button
                                        onClick={() => handleUpdateStatus(t.ticketId, 'Assigned')}
                                        className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-xs font-medium"
                                      >
                                        Accept & Assign
                                      </button>
                                    )}

                                    {status === 'assigned' && (
                                      <button
                                        onClick={() => handleUpdateStatus(t.ticketId, 'InProgress')}
                                        className="px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-xs font-medium flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3" />
                                        Start Progress
                                      </button>
                                    )}

                                    {status === 'inprogress' && (
                                      <button
                                        onClick={() => handleUpdateStatus(t.ticketId, 'Resolved')}
                                        className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-medium flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        Resolve
                                      </button>
                                    )}

                                    {status === 'resolved' && (
                                      <button
                                        onClick={() => handleUpdateStatus(t.ticketId, 'Closed')}
                                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium"
                                      >
                                        Close
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
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
        </div>
      )}

      {/* VIEW TICKET MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Ticket Details"
        subtitle={selectedTicket?.ticketId}
        maxWidth="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs">
            {(() => {
              const meta = getTicketMeta(selectedTicket.title);
              return (
                <>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">
                        Area: {meta.area}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold text-[11px]">
                        Assigned Role: {meta.assignedRole}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{meta.cleanTitle}</h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">PRIORITY</span>
                      <span className="font-semibold text-slate-900">{selectedTicket.priority}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">STATUS</span>
                      <StatusBadge status={selectedTicket.status || 'Open'} />
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">ASSIGNED ROLE</span>
                      <span className="font-semibold text-slate-800">{meta.assignedRole}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">CREATED DATE</span>
                      <span className="text-slate-700">
                        {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
