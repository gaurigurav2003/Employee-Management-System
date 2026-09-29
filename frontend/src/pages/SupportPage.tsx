import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supportApi } from '../api/supportApi';
import { employeeApi } from '../api/employeeApi';
import {
  SupportTicketResponseDto,
  SupportTicketCreateDto,
  EmployeeResponseDto,
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
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user, isAdmin, isSupport, isHR } = useAuth();
  const { success, error: toastError } = useToast();

  const [myTickets, setMyTickets] = useState<SupportTicketResponseDto[]>([]);
  const [teamTickets, setTeamTickets] = useState<SupportTicketResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'management'>('my');
  const [supportStaff, setSupportStaff] = useState<EmployeeResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket creation form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Assign & Status modals
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketResponseDto | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');

  const canManageTickets = isAdmin || isSupport || isHR;

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load own tickets for all roles
      if (user?.employeeId) {
        const mine = await supportApi.getByEmployeeId(user.employeeId).catch(() => []);
        setMyTickets(Array.isArray(mine) ? mine : []);
      } else {
        setMyTickets([]);
      }

      // 2. Load all tickets queue for management
      if (canManageTickets) {
        const all = await supportApi.getAll().catch(() => []);
        setTeamTickets(Array.isArray(all) ? all : []);

        const employees = await employeeApi.getAll().catch(() => []);
        const staff = (employees || []).filter(
          (e) => (e.role || '').toLowerCase().includes('support') || (e.role || '').toLowerCase().includes('admin')
        );
        setSupportStaff(staff.length > 0 ? staff : employees);
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
    if (!user?.employeeId) {
      toastError('Employee profile is not loaded. Please make sure you are signed in.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      toastError('Title and description are required.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: SupportTicketCreateDto = {
        employeeId: user.employeeId,
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      await supportApi.create(dto);
      success('Support ticket created successfully.');
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to create ticket.', 'Error', err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !assigneeId) return;

    setIsSubmitting(true);
    try {
      await supportApi.update(selectedTicket.ticketId, {
        status: 'Assigned',
        assignedTo: assigneeId,
      });
      success('Ticket assigned to staff member.');
      setIsAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to assign ticket.');
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

  // Status counts for management tab
  const countOpen = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'open').length;
  const countAssigned = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'assigned').length;
  const countInProgress = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'inprogress').length;
  const countResolved = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'resolved').length;
  const countClosed = teamTickets.filter((t) => (t.status || '').toLowerCase() === 'closed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            WORKSPACE / SUPPORT
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Support</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage workplace support tickets and requests.
          </p>
        </div>

        {/* Tab switch for support staff / admin / HR */}
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
              <p className="text-xs text-slate-500">Submit an issue for the IT / operations team</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Ticket Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you need help with?"
                  required
                />
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'Low', label: 'Low - General inquiry or minor request' },
                    { value: 'Medium', label: 'Medium - Standard service request' },
                    { value: 'High', label: 'High - Urgent / blocking issue' },
                  ]}
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
                  placeholder="Describe the issue in detail..."
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
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myTickets.map((t) => (
                      <tr key={t.ticketId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">
                          {t.ticketId?.slice(0, 8).toUpperCase()}...
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{t.title}</div>
                          <div className="text-[11px] text-slate-400 max-w-sm truncate">
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
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs"
                          >
                            View
                          </button>
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
                <p className="text-xs text-slate-500">Live request feed from SupportService</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: {teamTickets.length}</span>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Querying SupportService tickets..." />
            ) : teamTickets.length === 0 ? (
              <EmptyState
                title="No support tickets in queue"
                description="All support requests will appear here for assignment and review."
                icon={<LifeBuoy className="w-6 h-6" />}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamTickets.map((t) => {
                      const status = (t.status || 'Open').toLowerCase();

                      return (
                        <tr key={t.ticketId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {t.ticketId?.slice(0, 8).toUpperCase()}...
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{t.title}</div>
                            <div className="text-[11px] text-slate-400 max-w-sm truncate">
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
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {t.assignedTo ? `${t.assignedTo.slice(0, 8)}...` : 'Unassigned'}
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
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs"
                              >
                                View
                              </button>

                              {status === 'open' && (
                                <button
                                  onClick={() => {
                                    setSelectedTicket(t);
                                    setIsAssignModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-xs font-medium"
                                >
                                  Assign
                                </button>
                              )}

                              {status === 'assigned' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.ticketId, 'InProgress')}
                                  className="px-2 py-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded text-xs font-medium"
                                >
                                  Start
                                </button>
                              )}

                              {status === 'inprogress' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.ticketId, 'Resolved')}
                                  className="px-2 py-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded text-xs font-medium"
                                >
                                  Resolve
                                </button>
                              )}

                              {status === 'resolved' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.ticketId, 'Closed')}
                                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium"
                                >
                                  Close
                                </button>
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
        </div>
      )}

      {/* ASSIGN TICKET MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Support Ticket"
        subtitle={`Assign ticket: ${selectedTicket?.title}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignTicket} isLoading={isSubmitting}>
              Assign Ticket
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignTicket} className="space-y-4">
          <Select
            label="Assign to Staff Member"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={supportStaff.map((s) => ({
              value: s.employeeId,
              label: `${s.firstName} ${s.lastName} (${s.role || 'Support'})`,
            }))}
            placeholder="Select a support staff member"
            required
          />
        </form>
      </Modal>

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
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-sm text-slate-900 mb-1">{selectedTicket.title}</h4>
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
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">ASSIGNED TO</span>
                <span className="font-mono text-slate-700">
                  {selectedTicket.assignedTo || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">CREATED DATE</span>
                <span className="text-slate-700">
                  {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
