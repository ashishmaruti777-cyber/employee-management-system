import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { fetchEmployees, fetchMyProfile, updateEmployee } from '../slices/employeeSlice';
import { fetchDepartments } from '../slices/departmentSlice';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MyProfile = ({ emp, onEdit }) => {
  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>{value || '-'}</span>
    </div>
  );
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>My Profile</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>View your profile details.</p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => onEdit(emp)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* Left Card - Basic Info */}
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.5rem', margin: '0 auto 16px' }}>
              {emp.firstName[0]}{emp.lastName[0]}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{emp.firstName} {emp.lastName}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{emp.position}</p>
            <span className={`badge ${emp.status === 'active' ? 'badge-success' : emp.status === 'on-leave' ? 'badge-warning' : 'badge-secondary'}`}>
              {emp.status?.replace('-', ' ')}
            </span>
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <InfoRow label="Employee ID" value={emp.employeeId} />
              <InfoRow label="Department" value={emp.department?.name} />
              <InfoRow label="Email" value={emp.email} />
              <InfoRow label="Phone" value={emp.phone} />
              <InfoRow label="Join Date" value={emp.joinDate?.split('T')[0]} />
              <InfoRow label="Salary" value={`₹${emp.salary?.toLocaleString()}`} />
            </div>
          </div>

          {/* Right Cards - Details */}
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Personal Info */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Date of Birth" value={emp.dateOfBirth?.split('T')[0]} />
                <InfoRow label="Gender" value={emp.gender} />
                <InfoRow label="Nationality" value={emp.personalInfo?.nationality} />
                <InfoRow label="Marital Status" value={emp.personalInfo?.maritalStatus} />
                <InfoRow label="Blood Group" value={emp.personalInfo?.bloodGroup} />
                <InfoRow label="Religion" value={emp.personalInfo?.religion} />
              </div>
            </div>

            {/* Address */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Street" value={emp.address?.street} />
                <InfoRow label="City" value={emp.address?.city} />
                <InfoRow label="State" value={emp.address?.state} />
                <InfoRow label="ZIP Code" value={emp.address?.zipCode} />
                <InfoRow label="Country" value={emp.address?.country} />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Emergency Contact</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Name" value={emp.emergencyContact?.name} />
                <InfoRow label="Phone" value={emp.emergencyContact?.phone} />
                <InfoRow label="Relationship" value={emp.emergencyContact?.relationship} />
              </div>
            </div>

            {/* Bank Details */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Bank Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Account Name" value={emp.bankDetails?.accountName} />
                <InfoRow label="Account Number" value={emp.bankDetails?.accountNumber} />
                <InfoRow label="Bank Name" value={emp.bankDetails?.bankName} />
                <InfoRow label="IFSC Code" value={emp.bankDetails?.ifscCode} />
                <InfoRow label="Branch" value={emp.bankDetails?.branch} />
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Documents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Aadhar Number" value={emp.documents?.aadharNumber} />
                <InfoRow label="PAN Number" value={emp.documents?.panNumber} />
                <InfoRow label="Passport" value={emp.documents?.passportNumber} />
                <InfoRow label="Driving License" value={emp.documents?.drivingLicense} />
              </div>
            </div>

            {/* Education */}
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Education</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <InfoRow label="Highest Degree" value={emp.education?.highestDegree} />
                <InfoRow label="Institution" value={emp.education?.institution} />
                <InfoRow label="Year of Passing" value={emp.education?.yearOfPassing} />
                <InfoRow label="Percentage" value={emp.education?.percentage} />
              </div>
            </div>

            {/* Skills */}
            {emp.skills?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {emp.skills.map((s) => (
                    <span key={s} style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const emptyEditForm = {
  phone: '',
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  emergencyContact: { name: '', phone: '', relationship: '' },
  bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branch: '' },
  documents: { aadharNumber: '', panNumber: '', passportNumber: '', drivingLicense: '' },
  personalInfo: { nationality: '', maritalStatus: '', bloodGroup: '', religion: '' },
  education: { highestDegree: '', institution: '', yearOfPassing: '', percentage: '' },
  skills: [],
  notes: '',
};

const Employees = () => {
  const dispatch = useDispatch();
  const { items: employees, pagination, loading } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);
  const isEmployee = user?.role === 'employee';

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyEditForm);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('phone');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isEmployee) {
      dispatch(fetchMyProfile());
    } else {
      dispatch(fetchEmployees({ page, limit: 10, search, department: deptFilter }));
      dispatch(fetchDepartments());
    }
  }, [dispatch, page, search, deptFilter, isEmployee]);

  const myProfile = isEmployee ? employees[0] : null;

  const handleEdit = (emp) => {
    setForm({
      phone: emp.phone || '',
      address: emp.address || emptyEditForm.address,
      emergencyContact: emp.emergencyContact || emptyEditForm.emergencyContact,
      bankDetails: emp.bankDetails || emptyEditForm.bankDetails,
      documents: emp.documents || emptyEditForm.documents,
      personalInfo: emp.personalInfo || emptyEditForm.personalInfo,
      education: emp.education || emptyEditForm.education,
      skills: emp.skills || [],
      notes: emp.notes || '',
    });
    setEditId(emp._id);
    setActiveTab('phone');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateEmployee({ id: editId, data: form })).unwrap();
      toast.success('Profile updated!');
      setShowModal(false);
      if (isEmployee) dispatch(fetchMyProfile());
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const updateNested = (section, field, value) => {
    setForm({ ...form, [section]: { ...form[section], [field]: value } });
  };

  if (isEmployee) {
    if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><Loading /></div></div>;
    if (!myProfile) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="empty-state"><h3>Profile not found</h3></div></div></div>;
    return (
      <>
        <MyProfile emp={myProfile} onEdit={handleEdit} />
        <EditModal showModal={showModal} setShowModal={setShowModal} editId={editId} form={form} setForm={setForm} activeTab={activeTab} setActiveTab={setActiveTab} handleSubmit={handleSubmit} skillInput={skillInput} setSkillInput={skillInput2 => setSkillInput(skillInput2)} addSkill={addSkill} removeSkill={removeSkill} updateNested={updateNested} />
      </>
    );
  }

  const handleDelete = async (id) => {
    const { deleteEmployee: delEmp } = await import('../slices/employeeSlice');
    await dispatch(delEmp(id));
    toast.success('Employee deleted!');
    dispatch(fetchEmployees({ page, limit: 10, search, department: deptFilter }));
  };

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const emptyForm = {
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: 'male',
    department: '', position: '', employmentType: 'full-time', joinDate: '', salary: '',
    status: 'active', workShift: 'morning', probationEndDate: '', contractEndDate: '', reportingTo: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branch: '' },
    documents: { aadharNumber: '', panNumber: '', passportNumber: '', drivingLicense: '' },
    personalInfo: { nationality: '', maritalStatus: '', bloodGroup: '', religion: '' },
    education: { highestDegree: '', institution: '', yearOfPassing: '', percentage: '' },
    experience: { totalYears: '', previousCompany: '', previousPosition: '' },
    skills: [], notes: '',
  };

  const [adminForm, setAdminForm] = useState(emptyForm);
  const [adminEditId, setAdminEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!adminForm.firstName.trim()) e.firstName = 'Required';
    if (!adminForm.lastName.trim()) e.lastName = 'Required';
    if (!adminForm.email.trim()) e.email = 'Required';
    if (!adminForm.department) e.department = 'Required';
    if (!adminForm.position.trim()) e.position = 'Required';
    if (!adminForm.joinDate) e.joinDate = 'Required';
    if (!adminForm.salary || adminForm.salary <= 0) e.salary = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdminEdit = (emp) => {
    setAdminForm({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth?.split('T')[0] || '', gender: emp.gender,
      department: emp.department?._id || '', position: emp.position, employmentType: emp.employmentType,
      joinDate: emp.joinDate?.split('T')[0] || '', salary: emp.salary, status: emp.status,
      workShift: emp.workShift || 'morning', probationEndDate: emp.probationEndDate?.split('T')[0] || '',
      contractEndDate: emp.contractEndDate?.split('T')[0] || '', reportingTo: emp.reportingTo || '',
      address: emp.address || emptyForm.address, emergencyContact: emp.emergencyContact || emptyForm.emergencyContact,
      bankDetails: emp.bankDetails || emptyForm.bankDetails, documents: emp.documents || emptyForm.documents,
      personalInfo: emp.personalInfo || emptyForm.personalInfo, education: emp.education || emptyForm.education,
      experience: emp.experience || emptyForm.experience, skills: emp.skills || [], notes: emp.notes || '',
    });
    setAdminEditId(emp._id);
    setActiveTab('personal');
    setShowModal(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...adminForm, salary: Number(adminForm.salary),
        experience: { ...adminForm.experience, totalYears: Number(adminForm.experience.totalYears) || 0 },
        education: { ...adminForm.education, yearOfPassing: Number(adminForm.education.yearOfPassing) || null },
      };
      if (adminEditId) {
        await dispatch(updateEmployee({ id: adminEditId, data: payload })).unwrap();
        toast.success('Employee updated!');
      }
      setShowModal(false);
      dispatch(fetchEmployees({ page, limit: 10, search, department: deptFilter }));
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const renderAdminFormContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input value={adminForm.firstName} onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })} />
                {errors.firstName && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.firstName}</small>}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input value={adminForm.lastName} onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })} />
                {errors.lastName && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.lastName}</small>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
                {errors.email && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.email}</small>}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" value={adminForm.dateOfBirth} onChange={(e) => setAdminForm({ ...adminForm, dateOfBirth: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={adminForm.gender} onChange={(e) => setAdminForm({ ...adminForm, gender: e.target.value })}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'employment':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select value={adminForm.department} onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}>
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                {errors.department && <small style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.department}</small>}
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input value={adminForm.position} onChange={(e) => setAdminForm({ ...adminForm, position: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Salary *</label>
                <input type="number" value={adminForm.salary} onChange={(e) => setAdminForm({ ...adminForm, salary: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={adminForm.status} onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option><option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Join Date *</label>
                <input type="date" value={adminForm.joinDate} onChange={(e) => setAdminForm({ ...adminForm, joinDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Work Shift</label>
                <select value={adminForm.workShift} onChange={(e) => setAdminForm({ ...adminForm, workShift: e.target.value })}>
                  <option value="morning">Morning</option><option value="afternoon">Afternoon</option>
                  <option value="night">Night</option><option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'address':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Street</label>
              <input value={adminForm.address.street} onChange={(e) => updateNested('address', 'street', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group"><label>City</label><input value={adminForm.address.city} onChange={(e) => updateNested('address', 'city', e.target.value)} /></div>
              <div className="form-group"><label>State</label><input value={adminForm.address.state} onChange={(e) => updateNested('address', 'state', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>ZIP</label><input value={adminForm.address.zipCode} onChange={(e) => updateNested('address', 'zipCode', e.target.value)} /></div>
              <div className="form-group"><label>Country</label><input value={adminForm.address.country} onChange={(e) => updateNested('address', 'country', e.target.value)} /></div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Employees</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>Manage your team members.</p>
          </div>
        </div>
        <div className="card">
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1, maxWidth: 360 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          {loading ? <Loading /> : employees.length === 0 ? (
            <div className="empty-state">
              <h3>No employees found</h3><p>Try adjusting your search.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{emp.employeeId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                          <span style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.email}</td>
                      <td><span className="badge badge-primary">{emp.department?.name || 'N/A'}</span></td>
                      <td>{emp.position}</td>
                      <td>
                        <span className={`badge ${emp.status === 'active' ? 'badge-success' : emp.status === 'on-leave' ? 'badge-warning' : 'badge-secondary'}`}>
                          {emp.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleAdminEdit(emp)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(emp._id); setShowDelete(true); }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Profile" size="large" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={isEmployee ? handleSubmit : handleAdminSubmit}>Update</button>
        </>
      }>
        {isEmployee ? (
          <EditFormContent form={form} setForm={setForm} activeTab={activeTab} setActiveTab={setActiveTab} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} updateNested={updateNested} />
        ) : (
          <div style={{ display: 'flex', gap: 0, minHeight: 400 }}>
            <div style={{ width: 180, borderRight: '1px solid var(--border-light)', paddingRight: 16, flexShrink: 0 }}>
              {['personal', 'employment', 'address'].map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 4, textAlign: 'left',
                }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </div>
            <div style={{ flex: 1, paddingLeft: 20 }}>{renderAdminFormContent()}</div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => handleDelete(deleteId)} />
    </div>
  );
};

const EditFormContent = ({ form, setForm, activeTab, setActiveTab, skillInput, setSkillInput, addSkill, removeSkill, updateNested }) => {
  const empTabs = [
    { id: 'phone', label: 'Phone', icon: '📱' },
    { id: 'address', label: 'Address', icon: '🏠' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'bank', label: 'Bank', icon: '🏦' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⭐' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'phone':
        return (
          <div className="form-group">
            <label>Phone</label>
            <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        );
      case 'address':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}><label>Street</label><input value={form.address.street} onChange={(e) => updateNested('address', 'street', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>City</label><input value={form.address.city} onChange={(e) => updateNested('address', 'city', e.target.value)} /></div>
              <div className="form-group"><label>State</label><input value={form.address.state} onChange={(e) => updateNested('address', 'state', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>ZIP</label><input value={form.address.zipCode} onChange={(e) => updateNested('address', 'zipCode', e.target.value)} /></div>
              <div className="form-group"><label>Country</label><input value={form.address.country} onChange={(e) => updateNested('address', 'country', e.target.value)} /></div>
            </div>
          </>
        );
      case 'emergency':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Name</label><input value={form.emergencyContact.name} onChange={(e) => updateNested('emergencyContact', 'name', e.target.value)} /></div>
              <div className="form-group"><label>Phone</label><input value={form.emergencyContact.phone} onChange={(e) => updateNested('emergencyContact', 'phone', e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select value={form.emergencyContact.relationship} onChange={(e) => updateNested('emergencyContact', 'relationship', e.target.value)}>
                <option value="">Select</option><option value="spouse">Spouse</option><option value="parent">Parent</option>
                <option value="sibling">Sibling</option><option value="child">Child</option><option value="friend">Friend</option>
              </select>
            </div>
          </>
        );
      case 'bank':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Account Name</label><input value={form.bankDetails.accountName} onChange={(e) => updateNested('bankDetails', 'accountName', e.target.value)} /></div>
              <div className="form-group"><label>Account Number</label><input value={form.bankDetails.accountNumber} onChange={(e) => updateNested('bankDetails', 'accountNumber', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Bank Name</label><input value={form.bankDetails.bankName} onChange={(e) => updateNested('bankDetails', 'bankName', e.target.value)} /></div>
              <div className="form-group"><label>IFSC</label><input value={form.bankDetails.ifscCode} onChange={(e) => updateNested('bankDetails', 'ifscCode', e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Branch</label><input value={form.bankDetails.branch} onChange={(e) => updateNested('bankDetails', 'branch', e.target.value)} /></div>
          </>
        );
      case 'documents':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Aadhar</label><input value={form.documents.aadharNumber} onChange={(e) => updateNested('documents', 'aadharNumber', e.target.value)} /></div>
              <div className="form-group"><label>PAN</label><input value={form.documents.panNumber} onChange={(e) => updateNested('documents', 'panNumber', e.target.value.toUpperCase())} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Passport</label><input value={form.documents.passportNumber} onChange={(e) => updateNested('documents', 'passportNumber', e.target.value)} /></div>
              <div className="form-group"><label>Driving License</label><input value={form.documents.drivingLicense} onChange={(e) => updateNested('documents', 'drivingLicense', e.target.value)} /></div>
            </div>
          </>
        );
      case 'education':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Degree</label>
                <select value={form.education.highestDegree} onChange={(e) => updateNested('education', 'highestDegree', e.target.value)}>
                  <option value="">Select</option><option value="High School">High School</option><option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor's</option><option value="Master's">Master's</option><option value="PhD">PhD</option>
                </select>
              </div>
              <div className="form-group"><label>Institution</label><input value={form.education.institution} onChange={(e) => updateNested('education', 'institution', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Year</label><input type="number" value={form.education.yearOfPassing} onChange={(e) => updateNested('education', 'yearOfPassing', e.target.value)} /></div>
              <div className="form-group"><label>Percentage</label><input value={form.education.percentage} onChange={(e) => updateNested('education', 'percentage', e.target.value)} /></div>
            </div>
          </>
        );
      case 'skills':
        return (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input placeholder="Add skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} style={{ flex: 1 }} />
              <button type="button" className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
            </div>
            {form.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.skills.map((s) => (
                  <span key={s} style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {s}<button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </>
        );
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: 300 }}>
      <div style={{ width: 150, borderRight: '1px solid var(--border-light)', paddingRight: 12, flexShrink: 0 }}>
        {empTabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
            background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 4, textAlign: 'left',
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, paddingLeft: 20 }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
          {empTabs.find((t) => t.id === activeTab)?.icon} {empTabs.find((t) => t.id === activeTab)?.label}
        </h4>
        {renderContent()}
      </div>
    </div>
  );
};

const EditModal = ({ showModal, setShowModal, editId, form, setForm, activeTab, setActiveTab, handleSubmit, skillInput, setSkillInput, addSkill, removeSkill, updateNested }) => (
  <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Profile" size="large" footer={
    <>
      <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
      <button className="btn btn-primary" onClick={handleSubmit}>Update</button>
    </>
  }>
    <EditFormContent form={form} setForm={setForm} activeTab={activeTab} setActiveTab={setActiveTab} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} updateNested={updateNested} />
  </Modal>
);

export default Employees;
