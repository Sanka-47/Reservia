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

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  service: Service;
}

interface PaginatedBookings {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const AdminPortal: React.FC = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');
  
  // Services states
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDuration, setServiceDuration] = useState(30);
  const [servicePrice, setServicePrice] = useState(0);
  const [serviceIsActive, setServiceIsActive] = useState(true);
  const [serviceError, setServiceError] = useState('');

  // Bookings states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, [bookingsPage, searchQuery, statusFilter]);

  // Load services
  const fetchServices = async () => {
    try {
      const response = await api.get<Service[]>('/services');
      setServices(response.data);
    } catch (e) {
      console.error('Failed to load services:', e);
    }
  };

  // Load bookings
  const fetchBookings = async () => {
    try {
      const response = await api.get<PaginatedBookings>('/bookings', {
        params: {
          page: bookingsPage,
          limit: 8,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
        },
      });
      setBookings(response.data.data);
      setBookingsTotal(response.data.total);
      setBookingsTotalPages(response.data.totalPages);
    } catch (e) {
      console.error('Failed to load bookings:', e);
    }
  };

  // Statistics summaries
  const totalBookings = bookingsTotal;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const estimatedRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.service?.price || 0), 0);

  // Manage Services Actions
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceTitle('');
    setServiceDesc('');
    setServiceDuration(30);
    setServicePrice(10);
    setServiceIsActive(true);
    setServiceError('');
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setServiceTitle(service.title);
    setServiceDesc(service.description);
    setServiceDuration(service.duration);
    setServicePrice(service.price);
    setServiceIsActive(service.isActive);
    setServiceError('');
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError('');
    try {
      const payload = {
        title: serviceTitle,
        description: serviceDesc,
        duration: Number(serviceDuration),
        price: Number(servicePrice),
        isActive: serviceIsActive,
      };

      if (editingService) {
        await api.patch(`/services/${editingService.id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setShowServiceModal(false);
      fetchServices();
      // Re-fetch bookings in case names or prices updated dynamically
      fetchBookings();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setServiceError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || 'Cannot delete service. Check if active bookings reference it.');
    }
  };

  // Manage Booking Actions
  const handleUpdateBookingStatus = async (id: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || 'Failed to update booking status.');
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message?.[0] || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong> ({user?.email})</p>
        </div>
        <button className="btn btn-secondary btn-small" onClick={logout}>
          Logout ⮞
        </button>
      </div>

      {/* KPI Overview Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Total Bookings</h4>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{totalBookings}</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--warning)' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Active</h4>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--info)' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Confirmed</h4>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--info)' }}>{confirmedCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--success)' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Completed</h4>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{completedCount}</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: '3px solid var(--accent)' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>Est. Revenue</h4>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>${estimatedRevenue.toFixed(2)}</span>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings Manager
        </button>
        <button 
          className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('services')}
        >
          ⚙️ Service Catalog CRUD
        </button>
      </div>

      {/* TAB 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* Filters area */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '300px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by customer, phone, email or service name..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchVal);
                    setBookingsPage(1);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery(searchVal);
                  setBookingsPage(1);
                }}
              >
                🔍 Search
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                className="form-input" 
                style={{ width: '180px' }}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setBookingsPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {(searchQuery || statusFilter) && (
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchVal('');
                    setSearchQuery('');
                    setStatusFilter('');
                    setBookingsPage(1);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Customer Info</th>
                  <th style={{ padding: '12px' }}>Service Name</th>
                  <th style={{ padding: '12px' }}>Date & Time</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Notes</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dark)' }}>
                      No bookings matching your criteria were found.
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{booking.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.customerEmail} | {booking.customerPhone}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{booking.service?.title || 'Unknown Service'}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500' }}>{booking.bookingDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>at {booking.bookingTime}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge badge-${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={booking.notes || ''}>
                        {booking.notes || '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'end' }}>
                          {booking.status === 'PENDING' && (
                            <button 
                              className="btn btn-secondary btn-small" 
                              style={{ color: 'var(--info)' }}
                              onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                            <button 
                              className="btn btn-secondary btn-small"
                              style={{ color: 'var(--success)' }}
                              onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <button 
                              className="btn btn-danger btn-small"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {bookingsTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {bookingsPage} of {bookingsTotalPages} ({bookingsTotal} total)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary btn-small" 
                  disabled={bookingsPage <= 1}
                  onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                >
                  ◀ Prev
                </button>
                <button 
                  className="btn btn-secondary btn-small" 
                  disabled={bookingsPage >= bookingsTotalPages}
                  onClick={() => setBookingsPage(p => Math.min(bookingsTotalPages, p + 1))}
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: Services Management */}
      {activeTab === 'services' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Active Service Catalog</h2>
            <button className="btn btn-primary btn-small" onClick={handleOpenAddService}>
              + Add New Service
            </button>
          </div>

          {/* Services list table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Service Name</th>
                  <th style={{ padding: '12px' }}>Description</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '600', color: 'var(--text-main)' }}>{service.title}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {service.description}
                    </td>
                    <td style={{ padding: '12px' }}>🕒 {service.duration} mins</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--accent)' }}>${service.price.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${service.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'end' }}>
                        <button className="btn btn-secondary btn-small" onClick={() => handleOpenEditService(service)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDeleteService(service.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Service Add/Edit Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content glass-panel" style={{ padding: '32px' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setShowServiceModal(false)}
              >
                &times;
              </button>
            </div>

            {serviceError && (
              <div className="badge-cancelled" style={{ padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'block', fontSize: '0.85rem' }}>
                ⚠️ {serviceError}
              </div>
            )}

            <form onSubmit={handleSaveService}>
              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Haircut & Wash" 
                  required
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Describe the service..." 
                  required
                  rows={3}
                  value={serviceDesc}
                  onChange={e => setServiceDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min={5}
                    required
                    value={serviceDuration}
                    onChange={e => setServiceDuration(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    step="0.01"
                    min={0}
                    required
                    value={servicePrice}
                    onChange={e => setServicePrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
                <input 
                  type="checkbox" 
                  id="serviceActiveCheck"
                  checked={serviceIsActive}
                  onChange={e => setServiceIsActive(e.target.checked)}
                />
                <label htmlFor="serviceActiveCheck" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Service is active and bookable by customers
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Service
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
