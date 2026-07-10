import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Booking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  service: {
    id: string;
    title: string;
    price: number;
    duration: number;
  };
}

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rescheduling Modal/State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Generate timeslots from 09:00 to 17:30
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    const hh = hour.toString().padStart(2, '0');
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings?limit=50');
      setBookings(response.data.data);
    } catch (e) {
      console.error('Failed to load bookings:', e);
      setError('Could not retrieve your bookings list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setError('');
    setSuccess('');

    try {
      await api.patch(`/bookings/${id}/cancel`);
      setSuccess('Booking successfully cancelled.');
      // Refresh list
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel the booking.');
    }
  };

  const handleOpenReschedule = (booking: Booking) => {
    setEditingBooking(booking);
    setRescheduleDate(booking.bookingDate);
    setRescheduleTime(booking.bookingTime);
    setRescheduleNotes(booking.notes || '');
    setRescheduleError('');
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setRescheduleError('');
    setRescheduling(true);

    try {
      await api.patch(`/bookings/${editingBooking.id}`, {
        bookingDate: rescheduleDate,
        bookingTime: rescheduleTime,
        notes: rescheduleNotes || undefined,
      });

      setSuccess('Booking successfully rescheduled.');
      setEditingBooking(null);
      fetchBookings();
    } catch (err: any) {
      const msgs = err.response?.data?.message;
      setRescheduleError(Array.isArray(msgs) ? msgs.join(', ') : msgs || 'Rescheduling failed.');
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-confirmed';
      case 'CANCELLED': return 'badge-cancelled';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-pending';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading your appointments list...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Appointments</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your booked services, view statuses, and reschedule slots.
        </p>
      </header>

      {error && (
        <div className="badge-cancelled" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'block', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="badge-confirmed" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'block', textAlign: 'center', color: 'var(--success)' }}>
          ✓ {success}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📅</span>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No bookings found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't scheduled any services with us yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map(booking => (
            <div key={booking.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{booking.service?.title}</h3>
                  <span className={getStatusBadgeClass(booking.status)}>{booking.status}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p><strong>Appointment Time:</strong> {booking.bookingDate} at {booking.bookingTime}</p>
                  <p><strong>Price:</strong> ${booking.service?.price.toFixed(2)} ({booking.service?.duration} mins)</p>
                  {booking.notes && <p><strong>My Notes:</strong> "{booking.notes}"</p>}
                </div>
              </div>

              {/* Booking Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                  <>
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => handleOpenReschedule(booking)}
                    >
                      ✏️ Reschedule
                    </button>
                    <button 
                      className="btn btn-small"
                      style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', backgroundColor: 'transparent' }}
                      onClick={() => handleCancel(booking.id)}
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="modal-content glass-panel" style={{ padding: '32px', maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Reschedule Appointment</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setEditingBooking(null)}
              >
                &times;
              </button>
            </div>

            {rescheduleError && (
              <div className="badge-cancelled" style={{ padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'block', fontSize: '0.85rem' }}>
                ⚠️ {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group">
                <label className="form-label">Service</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingBooking.service?.title} 
                  disabled 
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  min={today}
                  required 
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Time Slot</label>
                <select 
                  className="form-input" 
                  required 
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Update Notes</label>
                <textarea 
                  className="form-input" 
                  placeholder="Notes about rescheduling..." 
                  rows={2}
                  value={rescheduleNotes}
                  onChange={e => setRescheduleNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingBooking(null)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={rescheduling}>
                  {rescheduling ? 'Saving...' : 'Reschedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
