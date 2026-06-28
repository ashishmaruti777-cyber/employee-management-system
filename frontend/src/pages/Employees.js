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
};

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
      if (editId) {
        await dispatch(updateEmployee({ id: editId, data: form })).unwrap();
        toast.success('Employee updated!');
      } else {
        await dispatch(createEmployee(form)).unwrap();
        toast.success('Employee created!');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      setErrors({});
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
    });
    setEditId(emp._id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    await dispatch(deleteEmployee(deleteId));
    toast.success('Employee deleted!');
    setShowDelete(false);
    setDeleteId(null);
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
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
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                              {emp.firstName} {emp.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {emp.email}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {emp.department?.name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem' }}>{emp.position}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            emp.status === 'active'
                              ? 'badge-success'
                              : emp.status === 'on-leave'
                              ? 'badge-warning'
                              : emp.status === 'inactive'
                              ? 'badge-secondary'
                              : 'badge-danger'
                          }`}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background:
                                emp.status === 'active'
                                  ? 'var(--success)'
                                  : emp.status === 'on-leave'
                                  ? 'var(--warning)'
                                  : emp.status === 'inactive'
                                  ? 'var(--text-muted)'
                                  : 'var(--danger)',
                            }}
                          />
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
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setDeleteId(emp._id);
                              setShowDelete(true);
                            }}
                          >
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
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
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
        <form>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Personal Information
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                {errors.firstName && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.firstName}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                {errors.lastName && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.lastName}
                  </small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="employee@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.email}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                {errors.dateOfBirth && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.dateOfBirth}
                  </small>
                )}
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
          </div>

          <div style={{ marginBottom: 20, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Employment Details
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.department}
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input
                  placeholder="Enter job position"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
                {errors.position && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.position}
                  </small>
                )}
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
                {errors.joinDate && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.joinDate}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Compensation & Status
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Salary *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                />
                {errors.salary && (
                  <small style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    {errors.salary}
                  </small>
                )}
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
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Employees;
