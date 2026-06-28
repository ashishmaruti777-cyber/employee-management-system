import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';

const HRNotifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await authAPI.getLoginRequests({ status: filter });
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (filter !== 'pending') return;
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [filter, fetchRequests]);

  const handleApprove = async (id) => {
    try {
      await authAPI.approveRequest(id);
      toast.success('Request approved!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async () => {
    try {
      await authAPI.rejectRequest(rejectModal, { reason: rejectReason });
      toast.success('Request rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>HR Login Approvals</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 1 }}>Review and approve employee login requests</p>
          </div>
          {filter === 'pending' && pendingCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--warning-light)', borderRadius: 'var(--radius)', fontSize: '0.78rem', fontWeight: 600, color: '#92400e' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
              {pendingCount} pending
            </div>
          )}
        </div>

        <div className="tabs" style={{ marginBottom: 14 }}>
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => { setFilter(f); setLoading(true); }} style={{ textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ width: 40, height: 40, margin: '0 auto 12px' }}>
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>No {filter === 'all' ? '' : filter} requests</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Login requests from employees will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {requests.map((req) => (
              <div key={req._id} className="card" style={{ padding: '12px 16px', borderLeft: `3px solid ${req.status === 'pending' ? '#f59e0b' : req.status === 'approved' ? '#10b981' : '#ef4444'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: req.status === 'pending' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : req.status === 'approved' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: req.status === 'pending' ? '#d97706' : req.status === 'approved' ? '#059669' : '#dc2626', flexShrink: 0 }}>
                    {req.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{req.name}</span>
                      <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'}`} style={{ fontSize: '0.65rem' }}>{req.status}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {req.employeeId} | {req.mobile} | {new Date(req.createdAt).toLocaleString()}
                    </div>
                    {req.status === 'approved' && req.hrName && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--success)', marginTop: 2 }}>Approved by {req.hrName}</div>
                    )}
                    {req.status === 'rejected' && req.rejectReason && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--danger)', marginTop: 2 }}>Rejected: {req.rejectReason}</div>
                    )}
                  </div>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-sm" style={{ background: 'var(--success)', color: 'white', fontSize: '0.72rem', padding: '5px 12px' }} onClick={() => handleApprove(req._id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><path d="M20 6L9 17l-5-5" /></svg>
                        Approve
                      </button>
                      <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white', fontSize: '0.72rem', padding: '5px 12px' }} onClick={() => { setRejectModal(req._id); setRejectReason(''); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {rejectModal && (
          <div className="modal-overlay" onClick={() => setRejectModal(null)}>
            <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Reject Login Request</h3>
                <button className="modal-close" onClick={() => setRejectModal(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for rejection</label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Enter reason..." style={{ resize: 'vertical', minHeight: 60 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setRejectModal(null)}>Cancel</button>
                <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleReject}>Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRNotifications;
