import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import Modal, { ConfirmModal } from '../components/common/Modal';
import API from '../api/api';
import toast from 'react-hot-toast';

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/backup/list');
      setBackups(data.data);
    } catch (err) {
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const { data } = await API.post('/backup/create');
      toast.success(`Backup created! Size: ${data.data.sizeFormatted}`);
      fetchBackups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      const { data } = await API.get(`/backup/download/${backup.fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup downloaded!');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    setRestoring(true);
    try {
      await API.post('/backup/restore', { fileName: selectedBackup.fileName });
      toast.success('Database restored successfully!');
      setShowRestore(false);
      setSelectedBackup(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBackup) return;
    try {
      await API.delete(`/backup/delete/${selectedBackup.fileName}`);
      toast.success('Backup deleted!');
      setShowDelete(false);
      setSelectedBackup(null);
      fetchBackups();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Backup & Restore</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>Manage database backups and restore points</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreateBackup} disabled={creating}>
            {creating ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                Creating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                Create Backup
              </>
            )}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ borderTop: '3px solid var(--primary)', textAlign: 'center', padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{backups.length}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Backups</p>
          </div>
          <div className="card" style={{ borderTop: '3px solid var(--success)', textAlign: 'center', padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
              {backups.length > 0 ? formatSize(backups[0].size) : '-'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latest Backup</p>
          </div>
          <div className="card" style={{ borderTop: '3px solid var(--info)', textAlign: 'center', padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
              {backups.reduce((sum, b) => sum + b.totalDocuments, 0)}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Documents</p>
          </div>
        </div>

        {loading ? <Loading /> : backups.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>No Backups Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>Create your first backup to protect your data</p>
            <button className="btn btn-primary" onClick={handleCreateBackup} disabled={creating}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Create First Backup
            </button>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Backup Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Size</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Collections</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Documents</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Created</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, idx) => (
                    <tr key={backup.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: idx === 0 ? 'var(--success-light)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={idx === 0 ? 'var(--success)' : 'var(--text-muted)'} strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{backup.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{backup.fileName}</div>
                          </div>
                          {idx === 0 && <span className="badge badge-success">Latest</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{backup.sizeFormatted}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span className="badge badge-info">{backup.collections}</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{backup.totalDocuments}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(backup.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleDownload(backup)} style={{ marginRight: 4 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" />
                          </svg>
                          Download
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => { setSelectedBackup(backup); setShowRestore(true); }} style={{ marginRight: 4, color: 'var(--info)', borderColor: 'var(--info)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                            <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          Restore
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setSelectedBackup(backup); setShowDelete(true); }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={showRestore} onClose={() => setShowRestore(false)} title="Restore Backup" footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowRestore(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRestore} disabled={restoring}>
              {restoring ? 'Restoring...' : 'Restore Now'}
            </button>
          </>
        }>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2" style={{ width: 30, height: 30 }}>
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Restore from backup?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              This will replace all current data with <strong>{selectedBackup?.name}</strong>.
            </p>
            <div style={{ background: 'var(--warning-light)', padding: 12, borderRadius: 'var(--radius)', marginTop: 16, textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 500 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 4 }}>
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Warning: This action cannot be undone. All current data will be lost.
              </p>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete Backup"
          message={`Are you sure you want to delete "${selectedBackup?.name}"? This cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default Backup;
