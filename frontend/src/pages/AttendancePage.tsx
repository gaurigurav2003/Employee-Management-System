import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { attendanceApi } from '../api/attendanceApi';
import { AttendanceResponseDto } from '../types';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Clock, LogIn, LogOut, CheckCircle2, Calendar, Users } from 'lucide-react';
import { employeeApi } from '../api/employeeApi';

export const AttendancePage: React.FC = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceResponseDto | null>(null);
  const [history, setHistory] = useState<AttendanceResponseDto[]>([]);
  const [teamRecords, setTeamRecords] = useState<AttendanceResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      if (user?.employeeId) {
        const myLogs = await attendanceApi.getByEmployeeId(user.employeeId).catch(() => []);
        const logs = Array.isArray(myLogs) ? myLogs : [];
        setHistory(logs);

        // Find today's record
        const todayStr = new Date().toISOString().slice(0, 10);
        const match = logs.find((r) => r.attendanceDate?.slice(0, 10) === todayStr);
        setTodayRecord(match || null);
      }

      if (isAdmin || isHR || isManager) {
        const teamLogs = await attendanceApi.getAll().catch(() => []);
        setTeamRecords(Array.isArray(teamLogs) ? teamLogs : []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user]);

  const handleCheckIn = async () => {
  setIsSubmitting(true);

  try {
    let employeeId = user?.employeeId;

    // HR / Admin / Manager may not have employeeId in login session
    if (!employeeId && user?.userId) {
      const employees = await employeeApi.getAll();

      const employee = employees.find(
        (emp) => emp.userId === user.userId
      );

      if (!employee) {
        toastError(
          'Employee profile not found for this user.',
          'Check-In Failed'
        );
        return;
      }

      employeeId = employee.employeeId;
    }

    if (!employeeId) {
      toastError(
        'Employee ID is not available.',
        'Check-In Failed'
      );
      return;
    }

    const now = new Date();

    await attendanceApi.checkIn({
      employeeId,
      attendanceDate: now.toISOString(),
      checkInTime: now.toISOString(),
      status: 'CheckedIn',
    });

    success('Checked in successfully for today.');

    await loadAttendance();

  } catch (err: any) {
    toastError(
      err.message ||
        'Check-in failed. You may have already checked in today.',
      'Conflict'
    );
  } finally {
    setIsSubmitting(false);
  }
};


const handleCheckOut = async () => {
  if (!todayRecord) {
    toastError(
      'No active check-in found for today.',
      'Action Required'
    );
    return;
  }

  setIsSubmitting(true);

  try {
    const now = new Date();

    await attendanceApi.checkOut(todayRecord.attendanceId, {
      checkOutTime: now.toISOString(),
      status: 'CheckedOut',
    });

    success('Checked out successfully.');

    await loadAttendance();
  } catch (err: any) {
    toastError(
      err.message || 'Check-out failed.',
      'Error'
    );
  } finally {
    setIsSubmitting(false);
  }
};

  // Compute work hours helper
 // Compute work hours helper
const calculateDuration = (
  checkIn?: string,
  checkOut?: string | null
) => {
  if (!checkIn) return '-';

  const start = new Date(checkIn).getTime();
  const end = checkOut
    ? new Date(checkOut).getTime()
    : Date.now();

  const diffMs = Math.max(0, end - start);

  const hours = Math.floor(
    diffMs / (1000 * 60 * 60)
  );

  const mins = Math.floor(
    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return `${hours}h ${mins}m`;
};

const getWorkingMinutes = (
  checkIn?: string,
  checkOut?: string | null
) => {
  if (!checkIn) return 0;

  const start = new Date(checkIn).getTime();

  const end = checkOut
    ? new Date(checkOut).getTime()
    : Date.now();

  return Math.max(
    0,
    Math.floor((end - start) / 60000)
  );
};




const getWeekStart = () => {
  const date = new Date();
  const day = date.getDay();

  const diff = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);

  return date;
};

const getWeeklyMinutes = () => {
  const weekStart = getWeekStart();

  return history.reduce((total, record) => {
    if (!record.checkInTime) return total;

    const checkIn = new Date(record.checkInTime);

    if (checkIn >= weekStart) {
      return total + getWorkingMinutes(
        record.checkInTime,
        record.checkOutTime
      );
    }

    return total;
  }, 0);
};

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

const getMonthlyAttendance = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  let workingDays = 0;
  let attendedDays = 0;

  for (let day = 1; day <= now.getDate(); day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Monday-Friday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;

      const attended = history.some((record) => {
        if (!record.checkInTime) return false;

        const checkIn = new Date(record.checkInTime);

        return (
          checkIn.getFullYear() === year &&
          checkIn.getMonth() === month &&
          checkIn.getDate() === day
        );
      });

      if (attended) {
        attendedDays++;
      }
    }
  }

  if (workingDays === 0) return 0;

  return Math.round((attendedDays / workingDays) * 100);
};
  const isCheckedIn = !!todayRecord && !todayRecord.checkOutTime;
  const isCompletedToday = !!todayRecord?.checkOutTime;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Wireframe 7 */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          WORKSPACE / ATTENDANCE
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">Attendance</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Check-in/check-out, daily and weekly hours, monthly attendance.
        </p>
      </div>

      {/* Main Check-In Clock Card matching Wireframe 7 */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
              TODAY · {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              {todayRecord ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Checked in at{' '}
                    <strong>{new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    {todayRecord.checkOutTime && (
                      <> · Checked out at <strong>{new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></>
                    )}
                  </span>
                </>
              ) : (
                <span>You have not recorded attendance for today yet.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!todayRecord ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckIn}
                isLoading={isSubmitting}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Check In
              </Button>
            ) : isCheckedIn ? (
              <Button
                variant="danger"
                size="lg"
                onClick={handleCheckOut}
                isLoading={isSubmitting}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Check Out
              </Button>
            ) : (
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Day completed
              </div>
            )}
          </div>
        </div>

        {/* 3 Metric counters below clock matching Wireframe 7 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              TODAY'S WORKING TIME
            </span>
            <div className="text-2xl font-bold text-slate-900">
              {todayRecord ? calculateDuration(todayRecord.checkInTime, todayRecord.checkOutTime) : '00h 00m'}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              THIS WEEK TOTAL
            </span>
            <div className="text-2xl font-bold text-slate-900">
  {formatMinutes(getWeeklyMinutes())}
</div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              MONTHLY ATTENDANCE
            </span>
          <div className="text-2xl font-bold text-emerald-600">
  {getMonthlyAttendance()}%
</div>
          </div>
        </div>
      </div>

      {/* Tabs: My Attendance vs Team Attendance */}
      {(isAdmin || isHR || isManager) && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'my'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            My Attendance History
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Team Attendance Log
          </button>
        </div>
      )}

      {/* Table matching Wireframe 7 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            {activeTab === 'my' ? 'Personal Attendance History' : 'Team Check-in Records'}
          </h3>
          <p className="text-xs text-slate-500">
            Recorded timestamps validated through AttendanceService
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Querying AttendanceService logs..." />
        ) : (activeTab === 'my' ? history : teamRecords).length === 0 ? (
          <EmptyState
            title="No attendance entries recorded"
            description="Your check-in and check-out logs will be securely cataloged here."
            icon={<Clock className="w-6 h-6" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'team' && <th className="py-3 px-4">Employee ID</th>}
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(activeTab === 'my' ? history : teamRecords).map((rec) => (
                  <tr key={rec.attendanceId} className="hover:bg-slate-50/80 transition-colors">
                    {activeTab === 'team' && (
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {rec.employeeId.slice(0, 8)}...
                      </td>
                    )}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {rec.attendanceDate ? new Date(rec.attendanceDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {calculateDuration(rec.checkInTime, rec.checkOutTime)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rec.status || (rec.checkOutTime ? 'CheckedOut' : 'CheckedIn')} />
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
