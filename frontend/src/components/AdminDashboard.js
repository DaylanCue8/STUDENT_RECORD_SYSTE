import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/AdminDashboard.css';

const API_BASE = 'http://localhost:8000/api';

// ─── Reusable Field wrapper ────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div className="admin-field-wrap">
        {label && <label className="admin-field-label">{label}</label>}
        {children}
        {error && <span className="admin-field-error">{error}</span>}
    </div>
);

// ─── Grade Badge ───────────────────────────────────────────────────────────────
const GradeBadge = ({ value }) => {
    const v     = parseFloat(value ?? 0);
    const color = v >= 3.5 ? '#22c55e' : v >= 2.5 ? '#f59e0b' : v >= 1 ? '#3b82f6' : '#94a3b8';
    return (
        <span
            className="admin-badge"
            style={{
                background: color + '18',
                color,
                border: `1px solid ${color}40`,
            }}
        >
            {v.toFixed(2)}
        </span>
    );
};

// ─── Modal Shell ───────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div
        className="admin-overlay"
        onClick={e => e.target === e.currentTarget && onClose()}
    >
        <div className="admin-modal">
            <div className="admin-modal-header">
                <h3 className="admin-modal-title">{title}</h3>
                <button className="admin-close-btn" onClick={onClose}>✕</button>
            </div>
            {children}
        </div>
    </div>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
    <div className={`admin-toast admin-toast-${type}`}>
        {type === 'error' ? '✕ ' : '✓ '}{message}
    </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ search }) => (
    <tr>
        <td colSpan={5} className="admin-empty-td">
            <div className="admin-empty-icon">🎓</div>
            <div className="admin-empty-title">
                {search ? `No students match "${search}"` : 'No students yet'}
            </div>
            <div className="admin-empty-sub">
                {search
                    ? 'Try a different search term'
                    : 'Click "+ Add Student" to get started'}
            </div>
        </td>
    </tr>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();

    const [students, setStudents]               = useState([]);
    const [courses, setCourses]                 = useState([]);
    const [semesters, setSemesters]             = useState([]);
    const [subjects, setSubjects]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [searchTerm, setSearchTerm]           = useState('');
    const [toast, setToast]                     = useState(null);

    // Modal states
    const [createOpen, setCreateOpen]           = useState(false);
    const [editOpen, setEditOpen]               = useState(false);
    const [deleteOpen, setDeleteOpen]           = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form state
    const [errors, setErrors]                   = useState({});
    const [submitting, setSubmitting]           = useState(false);

    const emptyForm = {
        first_name:  '',
        middle_name: '',
        last_name:   '',
        suffix:      '',
        email:       '',
        course_id:   '',
        year_level:  '',
        semester:    '',
    };

    const [newStudent, setNewStudent] = useState(emptyForm);
    const [editForm, setEditForm]     = useState([]); // Array of {subject_id, grade}

    // ── Auth guard + set global Axios token ───────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');

        if (!token || role !== 'admin') {
            localStorage.clear();
            navigate('/');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [navigate]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const getFullName = (u) => {
        if (!u) return '—';
        const parts = [u.first_name, u.middle_name, u.last_name].filter(Boolean);
        const name  = parts.join(' ');
        return u.suffix ? `${name} ${u.suffix}` : name;
    };

    const handleAxiosError = (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            navigate('/');
        } else if (error.response?.status === 422) {
            const laravelErrors = error.response.data.errors ?? {};
            const mapped = {};
            Object.keys(laravelErrors).forEach(key => {
                mapped[key] = laravelErrors[key][0];
            });
            setErrors(mapped);
        } else if (error.response?.status === 409) {
            setErrors({ email: 'This email is already registered.' });
        } else {
            showToast(
                error.response?.data?.message ?? 'Something went wrong.',
                'error'
            );
        }
    };

    // ── API calls ──────────────────────────────────────────────────────────────
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/students`);
            setStudents(res.data);
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/courses`);
            setCourses(res.data);
        } catch (err) {
            handleAxiosError(err);
        }
    };

    const fetchSemesters = async () => {
        try {
            const res = await axios.get(`${API_BASE}/semesters`);
            setSemesters(res.data);
        } catch (err) {
            handleAxiosError(err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_BASE}/subjects`);
            setSubjects(res.data);
        } catch (err) {
            handleAxiosError(err);
        }
    };

    useEffect(() => { 
        fetchStudents(); 
        fetchCourses();
        fetchSemesters();
        fetchSubjects();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE}/students`, newStudent);
            setCreateOpen(false);
            setNewStudent(emptyForm);
            fetchStudents();
            showToast('Student account created successfully.');
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        try {
            // Filter out empty grades and prepare data
            const gradesToUpdate = editForm
                .filter(item => item.grade !== '')
                .map(item => ({
                    subject_id: item.subject_id,
                    grade: parseFloat(item.grade) || 0
                }));

            if (gradesToUpdate.length === 0) {
                showToast('Please enter at least one grade.', 'error');
                return;
            }

            await axios.put(
                `${API_BASE}/students/${selectedStudent.id}/grade`,
                { grades: gradesToUpdate }
            );
            setEditOpen(false);
            fetchStudents();
            showToast('Grades updated successfully.');
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await axios.delete(`${API_BASE}/students/${selectedStudent.id}`);
            setDeleteOpen(false);
            fetchStudents();
            showToast('Student removed.');
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (student) => {
        setSelectedStudent(student);

        // Get subjects for student's current semester and year level
        const studentSubjects = subjects.filter(subject =>
            subject.course_id === student.course_id &&
            subject.semester_id === student.semester &&
            subject.year_level === student.year_level
        );

        // Initialize form with existing grades or empty
        const initialGrades = studentSubjects.map(subject => {
            const existingGrade = student.grades?.find(g => g.subject_id === subject.id);
            return {
                subject_id: subject.id,
                subject_name: subject.name,
                grade: existingGrade ? existingGrade.grade : ''
            };
        });

        setEditForm(initialGrades);
        setErrors({});
        setEditOpen(true);
    };

    const openDelete = (student) => {
        setSelectedStudent(student);
        setDeleteOpen(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE}/logout`);
        } catch (_) {}
        delete axios.defaults.headers.common['Authorization'];
        localStorage.clear();
        navigate('/');
    };

    // ── Filter ─────────────────────────────────────────────────────────────────
    const filtered = students.filter(s =>
        s.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())  ||
        s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())       ||
        s.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())     ||
        s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="admin-root">
            {toast && <Toast {...toast} />}

            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-mark">LNU</div>
                    <div>
                        <div className="admin-logo-title">SRS Admin</div>
                        <div className="admin-logo-sub">Student Records</div>
                    </div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-item admin-nav-item-active">
                        <span className="admin-nav-icon">👥</span> Students
                    </div>
                    <div className="admin-nav-item admin-nav-item-disabled">
                        <span className="admin-nav-icon">⚙️</span> Settings
                    </div>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-admin-info">
                        <div className="admin-avatar-sm">A</div>
                        <div>
                            <div className="admin-admin-name">Administrator</div>
                            <div className="admin-admin-role">Super Admin</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        ↩ Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-page-title">Student Management</h1>
                        <p className="admin-page-sub">
                            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                        </p>
                    </div>
                    <div className="admin-header-actions">
                        <div className="admin-search-wrap">
                            <span className="admin-search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, ID, email, course…"
                                className="admin-search-input"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="admin-add-btn"
                            onClick={() => {
                                setErrors({});
                                setNewStudent(emptyForm);
                                setCreateOpen(true);
                            }}
                        >
                            + Add Student
                        </button>
                    </div>
                </header>

                <div className="admin-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="admin-th">#</th>
                                <th className="admin-th">Student ID</th>
                                <th className="admin-th">Student</th>
                                <th className="admin-th">Course</th>
                                <th className="admin-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="admin-empty-td">
                                        Loading students…
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <EmptyState search={searchTerm} />
                            ) : (
                                filtered.map((student, i) => (
                                    <tr key={student.id} className="admin-tr">

                                        {/* # */}
                                        <td className="admin-td" style={{ color: '#94a3b8', fontSize: '13px', width: '40px' }}>
                                            {i + 1}
                                        </td>

                                        {/* Student ID */}
                                        <td className="admin-td">
                                            <span className="admin-student-id-badge">
                                                {student.student_id ?? '—'}
                                            </span>
                                        </td>

                                        {/* Name + Email */}
                                        <td className="admin-td">
                                            <div className="admin-student-cell">
                                                <div className="admin-avatar">
                                                    {student.user?.first_name?.charAt(0)?.toUpperCase() ?? '?'}
                                                </div>
                                                <div>
                                                    <div className="admin-student-name">
                                                        {getFullName(student.user)}
                                                    </div>
                                                    <div className="admin-student-email">
                                                        {student.user?.email ?? '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Course */}
                                        <td className="admin-td">
                                            <span className="admin-course-tag">{student.course?.name ?? '—'}</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="admin-td">
                                            <div className="admin-action-group">
                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() => navigate(`/admin/students/${student.id}`)}
                                                    title="View student profile"
                                                >
                                                    👤 Profile
                                                </button>
                                                <button
                                                    className="admin-edit-btn"
                                                    onClick={() => openEdit(student)}
                                                >
                                                    📊 Grades
                                                </button>
                                                <button
                                                    className="admin-delete-btn"
                                                    onClick={() => openDelete(student)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ── Create Student Modal ── */}
            {createOpen && (
                <Modal title="Create Student Account" onClose={() => setCreateOpen(false)}>
                    <form onSubmit={handleCreate} className="admin-form">

                        <div className="admin-form-grid">
                            <Field label="First Name *" error={errors.first_name}>
                                <input
                                    type="text"
                                    required
                                    className="admin-input"
                                    value={newStudent.first_name}
                                    onChange={e => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                />
                            </Field>
                            <Field label="Last Name *" error={errors.last_name}>
                                <input
                                    type="text"
                                    required
                                    className="admin-input"
                                    value={newStudent.last_name}
                                    onChange={e => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                />
                            </Field>
                        </div>

                        <div className="admin-form-grid">
                            <Field label="Middle Name" error={errors.middle_name}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Optional"
                                    value={newStudent.middle_name}
                                    onChange={e => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                                />
                            </Field>
                            <Field label="Suffix (Jr, III)" error={errors.suffix}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Optional"
                                    value={newStudent.suffix}
                                    onChange={e => setNewStudent({ ...newStudent, suffix: e.target.value })}
                                />
                            </Field>
                        </div>

                        <div className="admin-form-grid">
                            <Field label="Email Address *" error={errors.email}>
                                <input
                                    type="email"
                                    required
                                    className="admin-input"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </Field>
                            <Field label="Course *" error={errors.course_id}>
                                <select
                                    required
                                    className="admin-input"
                                    value={newStudent.course_id}
                                    onChange={e => setNewStudent({ ...newStudent, course_id: e.target.value })}
                                >
                                    <option value="">Select course…</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="admin-form-grid">
                            <Field label="Year Level *" error={errors.year_level}>
                                <select
                                    required
                                    className="admin-input"
                                    value={newStudent.year_level}
                                    onChange={e => setNewStudent({ ...newStudent, year_level: e.target.value })}
                                >
                                    <option value="">Select year…</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </Field>
                            <Field label="Semester *" error={errors.semester}>
                                <select
                                    required
                                    className="admin-input"
                                    value={newStudent.semester}
                                    onChange={e => setNewStudent({ ...newStudent, semester: e.target.value })}
                                >
                                    <option value="">Select semester…</option>
                                    <option value="1">1st Semester</option>
                                    <option value="2">2nd Semester</option>
                                </select>
                            </Field>
                        </div>

                        <div className="admin-hint">
                            🪪 Student ID is auto-generated on save.
                            &nbsp;·&nbsp;
                            🔑 Default password: <code>LEYTENORMALUNIVERSITY</code>
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                                className="admin-cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="admin-save-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving…' : 'Save Student'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Edit Grades Modal ── */}
            {editOpen && selectedStudent && (
                <Modal title={`Update Grades - ${selectedStudent.course?.name} Year ${selectedStudent.year_level} Sem ${selectedStudent.semester}`} onClose={() => setEditOpen(false)}>
                    <div className="admin-edit-student-info">
                        <div className="admin-avatar-lg">
                            {selectedStudent.user?.first_name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                            <div className="admin-edit-name">{getFullName(selectedStudent.user)}</div>
                            <div className="admin-edit-meta">
                                {selectedStudent.student_id && (
                                    <span style={{ marginRight: '8px', color: '#6366f1', fontWeight: 600 }}>
                                        {selectedStudent.student_id}
                                    </span>
                                )}
                                {selectedStudent.course?.name ?? '—'} • Year {selectedStudent.year_level} • Sem {selectedStudent.semester}
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleEdit} className="admin-form">
                        <div className="admin-grades-input-grid">
                            {editForm.map((item, index) => (
                                <div key={item.subject_id} className="admin-grade-input-row">
                                    <div className="admin-subject-label">
                                        {item.subject_name}
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="5"
                                        placeholder="0.00"
                                        className="admin-grade-input"
                                        value={item.grade}
                                        onChange={e => {
                                            const newForm = [...editForm];
                                            newForm[index].grade = e.target.value;
                                            setEditForm(newForm);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                onClick={() => setEditOpen(false)}
                                className="admin-cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="admin-save-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Updating…' : 'Update Grades'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Confirm Delete Modal ── */}
            {deleteOpen && selectedStudent && (
                <Modal title="Remove Student" onClose={() => setDeleteOpen(false)}>
                    <p className="admin-delete-text">
                        Are you sure you want to remove{' '}
                        <strong>{getFullName(selectedStudent.user)}</strong>
                        {selectedStudent.student_id && (
                            <span style={{ color: '#6366f1' }}> ({selectedStudent.student_id})</span>
                        )}?
                        This action cannot be undone.
                    </p>
                    <div className="admin-modal-footer">
                        <button
                            type="button"
                            onClick={() => setDeleteOpen(false)}
                            className="admin-cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            className="admin-save-btn admin-save-btn-danger"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            {submitting ? 'Removing…' : 'Yes, Remove'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;