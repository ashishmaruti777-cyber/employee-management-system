import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../slices/employeeSlice';
import { fetchDepartments } from '../slices/departmentSlice';
import toast from 'react-hot-toast';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  department: '',
  position: '',
  employmentType: 'full-time',
  joinDate: '',
  salary: '',
  status: 'active',
  workShift: 'morning',
  probationEndDate: '',
  contractEndDate: '',
  reportingTo: '',
  address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
  emergencyContact: { name: '', phone: '', relationship: '' },
  bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branch: '' },
  documents: { aadharNumber: '', panNumber: '', passportNumber: '', drivingLicense: '' },
  personalInfo: { nationality: '', maritalStatus: '', bloodGroup: '', religion: '' },
  education: { highestDegree: '', institution: '', yearOfPassing: '', percentage: '' },
  experience: { totalYears: '', previousCompany: '', previousPosition: '' },
  skills: [],
  notes: '',
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Employees = () => {
  const dispatch = useDispatch();
  const { items: employees, pagination, loading } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    dispatch(fetchEmployees({ page, limit: 10, search, department: deptFilter }));
    dispatch(fetchDepartments());
  }, [dispatch, page, search, deptFilter]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email is invalid';
    if (!form.department) e.department = 'Department is required';
    if (!form.position.trim()) e.position = 'Position is required';
    if (!form.joinDate) e.joinDate = 'Join date is required';
    if (!form.salary || form.salary <= 0) e.salary = 'Valid salary is required';
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        experience: { ...form.experience, totalYears: Number(form.experience.totalYears) || 0 },
        education: { ...form.education, yearOfPassing: Number(form.education.yearOfPassing) || null },
      };
      if (editId) {
        await dispatch(updateEmployee({ id: editId, data: payload })).unwrap();
        toast.success('Employee updated!');
      } else {
        await dispatch(createEmployee(payload)).unwrap();
        toast.success('Employee created!');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      setErrors({});
      setActiveTab('personal');
      dispatch(fetchEmployees({ page, limit: 10, search, department: deptFilter }));
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleEdit = (emp) => {
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      dateOfBirth: emp.dateOfBirth?.split('T')[0] || '',
      gender: emp.gender,
      department: emp.department?._id || '',
      position: emp.position,
      employmentType: emp.employmentType,
      joinDate: emp.joinDate?.split('T')[0] || '',
      salary: emp.salary,
      status: emp.status,
      workShift: emp.workShift || 'morning',
      probationEndDate: emp.probationEndDate?.split('T')[0] || '',
      contractEndDate: emp.contractEndDate?.split('T')[0] || '',
      reportingTo: emp.reportingTo || '',
      address: emp.address || emptyForm.address,
      emergencyContact: emp.emergencyContact || emptyForm.emergencyContact,
      bankDetails: emp.bankDetails || emptyForm.bankDetails,
      documents: emp.documents || emptyForm.documents,
      personalInfo: emp.personalInfo || emptyForm.personalInfo,
      education: emp.education || emptyForm.education,
      experience: emp.experience || emptyForm.experience,
      skills: emp.skills || [],
      notes: emp.notes || '',
    });
    setEditId(emp._id);
    setActiveTab('personal');
    setShowModal(true);
  };

  const handleDelete = async () => {
    await dispatch(deleteEmployee(deleteId));
    toast.success('Employee deleted!');
    setShowDelete(false);
    setDeleteId(null);
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

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'employment', label: 'Employment', icon: '💼' },
    { id: 'address', label: 'Address', icon: '🏠' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'bank', label: 'Bank Details', icon: '🏦' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills & Notes', icon: '⭐' },
  ];

  const renderError = (field) =>
    errors[field] ? (
      <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
        {errors[field]}
      </small>
    ) : null;

  const renderFormContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input placeholder="Enter first name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                {renderError('firstName')}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input placeholder="Enter last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                {renderError('lastName')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" placeholder="employee@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {renderError('email')}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                {renderError('dateOfBirth')}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nationality</label>
                <input placeholder="e.g. Indian" value={form.personalInfo.nationality} onChange={(e) => updateNested('personalInfo', 'nationality', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select value={form.personalInfo.maritalStatus} onChange={(e) => updateNested('personalInfo', 'maritalStatus', e.target.value)}>
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select value={form.personalInfo.bloodGroup} onChange={(e) => updateNested('personalInfo', 'bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Religion</label>
                <input placeholder="e.g. Hindu" value={form.personalInfo.religion} onChange={(e) => updateNested('personalInfo', 'religion', e.target.value)} />
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
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
                {renderError('department')}
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input placeholder="Enter job position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
                {renderError('position')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div className="form-group">
                <label>Join Date *</label>
                <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
                {renderError('joinDate')}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Salary (₹) *</label>
                <input type="number" placeholder="0.00" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                {renderError('salary')}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Work Shift</label>
                <select value={form.workShift} onChange={(e) => setForm({ ...form, workShift: e.target.value })}>
                  <option value="morning">Morning (9 AM - 6 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 9 PM)</option>
                  <option value="night">Night (9 PM - 6 AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Probation End Date</label>
                <input type="date" value={form.probationEndDate} onChange={(e) => setForm({ ...form, probationEndDate: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contract End Date</label>
                <input type="date" value={form.contractEndDate} onChange={(e) => setForm({ ...form, contractEndDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Total Experience (Years)</label>
                <input type="number" placeholder="0" min="0" max="50" value={form.experience.totalYears} onChange={(e) => updateNested('experience', 'totalYears', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Previous Company</label>
                <input placeholder="Enter previous company" value={form.experience.previousCompany} onChange={(e) => updateNested('experience', 'previousCompany', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Previous Position</label>
                <input placeholder="Enter previous position" value={form.experience.previousPosition} onChange={(e) => updateNested('experience', 'previousPosition', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 'address':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Street Address</label>
              <input placeholder="Enter street address" value={form.address.street} onChange={(e) => updateNested('address', 'street', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input placeholder="Enter city" value={form.address.city} onChange={(e) => updateNested('address', 'city', e.target.value)} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input placeholder="Enter state" value={form.address.state} onChange={(e) => updateNested('address', 'state', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ZIP / Postal Code</label>
                <input placeholder="Enter ZIP code" value={form.address.zipCode} onChange={(e) => updateNested('address', 'zipCode', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input placeholder="Enter country" value={form.address.country} onChange={(e) => updateNested('address', 'country', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 'emergency':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Name</label>
                <input placeholder="Emergency contact name" value={form.emergencyContact.name} onChange={(e) => updateNested('emergencyContact', 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input placeholder="+91 XXXXX XXXXX" value={form.emergencyContact.phone} onChange={(e) => updateNested('emergencyContact', 'phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select value={form.emergencyContact.relationship} onChange={(e) => updateNested('emergencyContact', 'relationship', e.target.value)}>
                <option value="">Select Relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        );

      case 'bank':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Account Holder Name</label>
                <input placeholder="Name as per bank records" value={form.bankDetails.accountName} onChange={(e) => updateNested('bankDetails', 'accountName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input placeholder="Enter account number" value={form.bankDetails.accountNumber} onChange={(e) => updateNested('bankDetails', 'accountNumber', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bank Name</label>
                <input placeholder="Enter bank name" value={form.bankDetails.bankName} onChange={(e) => updateNested('bankDetails', 'bankName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input placeholder="e.g. SBIN0001234" value={form.bankDetails.ifscCode} onChange={(e) => updateNested('bankDetails', 'ifscCode', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input placeholder="Enter branch name" value={form.bankDetails.branch} onChange={(e) => updateNested('bankDetails', 'branch', e.target.value)} />
            </div>
          </>
        );

      case 'documents':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Aadhar Number</label>
                <input placeholder="XXXX XXXX XXXX" maxLength="14" value={form.documents.aadharNumber} onChange={(e) => updateNested('documents', 'aadharNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input placeholder="e.g. ABCDE1234F" maxLength="10" style={{ textTransform: 'uppercase' }} value={form.documents.panNumber} onChange={(e) => updateNested('documents', 'panNumber', e.target.value.toUpperCase())} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Passport Number</label>
                <input placeholder="Enter passport number" value={form.documents.passportNumber} onChange={(e) => updateNested('documents', 'passportNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Driving License</label>
                <input placeholder="Enter driving license number" value={form.documents.drivingLicense} onChange={(e) => updateNested('documents', 'drivingLicense', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 'education':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Highest Degree</label>
                <select value={form.education.highestDegree} onChange={(e) => updateNested('education', 'highestDegree', e.target.value)}>
                  <option value="">Select Degree</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input placeholder="Enter college/university name" value={form.education.institution} onChange={(e) => updateNested('education', 'institution', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year of Passing</label>
                <input type="number" placeholder="e.g. 2022" min="1950" max="2030" value={form.education.yearOfPassing} onChange={(e) => updateNested('education', 'yearOfPassing', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Percentage / CGPA</label>
                <input placeholder="e.g. 85% or 8.5 CGPA" value={form.education.percentage} onChange={(e) => updateNested('education', 'percentage', e.target.value)} />
              </div>
            </div>
          </>
        );

      case 'skills':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  placeholder="Type a skill and press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
              </div>
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem',
                        background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500,
                      }}
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, padding: 0, lineHeight: 1 }}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows={4}
                placeholder="Any additional notes about this employee..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ resize: 'vertical' }}
              />
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
              Manage your team members and their information.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setForm(emptyForm);
                setEditId(null);
                setErrors({});
                setActiveTab('personal');
                setShowModal(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>

        <div className="card">
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1, maxWidth: 360 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loading />
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56 }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>No employees found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {emp.employeeId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                              {emp.firstName} {emp.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.email}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">{emp.department?.name || 'N/A'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem' }}>{emp.position}</span>
                      </td>
                      <td>
                        <span className={`badge ${emp.status === 'active' ? 'badge-success' : emp.status === 'on-leave' ? 'badge-warning' : emp.status === 'inactive' ? 'badge-secondary' : 'badge-danger'}`}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: emp.status === 'active' ? 'var(--success)' : emp.status === 'on-leave' ? 'var(--warning)' : emp.status === 'inactive' ? 'var(--text-muted)' : 'var(--danger)' }} />
                          {emp.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(emp)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(emp._id); setShowDelete(true); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Delete
                          </button>
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Employee' : 'Add New Employee'}
        size="large"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editId ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Update Employee
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Create Employee
                </>
              )}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 0, minHeight: 400 }}>
          {/* Left Tab Navigation */}
          <div style={{ width: 180, borderRight: '1px solid var(--border-light)', paddingRight: 16, flexShrink: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  marginBottom: 4, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Form Content */}
          <div style={{ flex: 1, paddingLeft: 20 }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              {tabs.find((t) => t.id === activeTab)?.icon} {tabs.find((t) => t.id === activeTab)?.label}
            </h4>
            {renderFormContent()}
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Employees;
