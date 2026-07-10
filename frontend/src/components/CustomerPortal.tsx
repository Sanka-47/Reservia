import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Service {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface BookingResponse {
  id: string;
  customerName: string;
  bookingDate: string;
  bookingTime: string;
  service: {
    title: string;
  };
}

interface CustomerPortalProps {
  onRequireLogin: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onRequireLogin }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Generate 30-minute interval timeslots from 09:00 to 17:30
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    const hh = hour.toString().padStart(2, '0');
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  // Set min date to today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get<Service[]>('/services');
      setServices(response.data.filter(s => s.isActive));
    } catch (e) {
      console.error('Failed to load services:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (service: Service) => {
    // ENFORCE rule: Login required to book services
    if (!user) {
      onRequireLogin();
      return;
    }

    setSelectedService(service);
    setBookingSuccess(null);
    setSubmitError('');
    
    // Auto-populate customer fields from logged-in user profile
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phoneNumber);
    
    // Clear slot/notes
    setDate('');
    setTime('');
    setNotes('');
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    if (!selectedService) return;

    try {
      const response = await api.post<BookingResponse>('/bookings', {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        serviceId: selectedService.id,
        bookingDate: date,
        bookingTime: time,
        notes: notes || undefined,
      });

      setBookingSuccess(response.data);
      setSelectedService(null);
    } catch (error: any) {
      const msgs = error.response?.data?.message;
      setSubmitError(Array.isArray(msgs) ? msgs.join(', ') : msgs || 'Failed to submit booking. Check slot availability.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading booking services catalog...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Header */}
      <header style={{ textAlign: 'center', marginBottom: '48px', marginTop: '24px' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px' }}>Book Your Appointment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Choose from our range of premium, professional services and schedule a timeslot that fits your schedule in seconds.
        </p>
      </header>

      {/* Booking Success Banner */}
      {bookingSuccess && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto 40px auto', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</span>
            <h3 style={{ fontSize: '1.4rem' }}>Booking Confirmed!</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
            <p><strong>Booking ID:</strong> <span style={{ color: 'var(--text-main)' }}>{bookingSuccess.id}</span></p>
            <p><strong>Service:</strong> <span style={{ color: 'var(--text-main)' }}>{bookingSuccess.service?.title}</span></p>
            <p><strong>Name:</strong> <span style={{ color: 'var(--text-main)' }}>{bookingSuccess.customerName}</span></p>
            <p><strong>Date & Time:</strong> <span style={{ color: 'var(--text-main)' }}>{bookingSuccess.bookingDate} at {bookingSuccess.bookingTime}</span></p>
          </div>
          <button className="btn btn-secondary btn-small" style={{ marginTop: '20px' }} onClick={() => setBookingSuccess(null)}>
            Book another appointment
          </button>
        </div>
      )}

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {services.map(service => (
          <div key={service.id} className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '240px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>{service.title}</h3>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.25rem' }}>${service.price.toFixed(2)}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {service.description}
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                🕒 {service.duration} mins
              </span>
              <button className="btn btn-primary btn-small" onClick={() => handleOpenBooking(service)}>
                {user ? 'Book Now' : 'Sign In to Book'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {selectedService && user && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content glass-panel" style={{ padding: '32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Book {selectedService.title}</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedService(null)}
              >
                &times;
              </button>
            </div>

            {submitError && (
              <div className="badge-cancelled" style={{ padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'block', fontSize: '0.85rem' }}>
                ⚠️ {submitError}
              </div>
            )}

            <form onSubmit={handleBook}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="john@example.com" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+1234567890" 
                    required 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    min={today}
                    required 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Slots</label>
                  <select 
                    className="form-input" 
                    required 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Special Notes (Optional)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Any requirements or details..." 
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedService(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
