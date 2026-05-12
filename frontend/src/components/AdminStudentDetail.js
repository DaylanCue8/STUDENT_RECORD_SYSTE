import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/AdminStudentDetail.css';

const API_BASE = 'http://localhost:8000/api';

const AdminStudentDetail = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();

    const [student, setStudent]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [toast, setToast]               = useState(null);
    const [editingGrades, setEditingGrades] = useState(false);
    const [gradeForm, setGradeForm]       = useState([]);
    const [submitting, setSubmitting]     = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const [newStatus, setNewStatus]       = useState('');
    const [editingYearSem, setEditingYearSem] = useState(false);
    const [newYearLevel, setNewYearLevel] = useState('');
    const [newSemester, setNewSemester]   = useState('');

    // Auth guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');

        if (!token || role !== 'admin') {
            localStorage.clear();
            navigate('/');
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchStudent();
    }, [studentId, navigate]);

    const fetchStudent = async () => {
        try {
            const res = await axios.get(`${API_BASE}/students/${studentId}`);
            setStudent(res.data);
            setNewStatus(res.data.status);
            setNewYearLevel(res.data.year_level);
            setNewSemester(res.data.semester);
            
            // Initialize grade form with grades up to current year/sem
            if (res.data.grades) {
                const currentYear = res.data.year_level;
                const currentSem = res.data.semester;
                const filteredGrades = res.data.grades.filter(g => {
                    const subjYear = g.subject?.year_level;
                    const subjSem = g.subject?.semester_id; // assuming semester_id is 1 or 2
                    return subjYear <= currentYear && subjSem <= currentSem;
                });
                setGradeForm(filteredGrades.map(g => ({
                    id: g.id,
                    subject_id: g.subject_id,
                    subject_code: g.subject?.code || '—',
                    subject_name: g.subject?.name || '—',
                    grade: g.grade,
                    units: g.subject?.units || 0,
                    semester_id: g.subject?.semester_id
                })));
            }
        } catch (err) {
            showToast('Failed to load student details', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleGradeChange = (index, value) => {
        const updated = [...gradeForm];
        updated[index].grade = parseFloat(value) || 0;
        setGradeForm(updated);
    };

    const handleSaveGrades = async () => {
        setSubmitting(true);
        try {
            const gradesToUpdate = gradeForm.map(g => ({
                id: g.id,
                grade: g.grade
            }));

            // Update each grade individually
            for (const grade of gradesToUpdate) {
                await axios.put(`${API_BASE}/grades/${grade.id}`, {
                    grade: grade.grade
                });
            }

            showToast('Grades updated successfully');
            setEditingGrades(false);
            fetchStudent();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update grades', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveStatus = async () => {
        setSubmitting(true);
        try {
            await axios.put(`${API_BASE}/students/${studentId}`, {
                status: newStatus
            });
            setStudent({ ...student, status: newStatus });
            showToast('Status updated successfully');
            setEditingStatus(false);
        } catch (err) {
            showToast('Failed to update status', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveYearSem = async () => {
        setSubmitting(true);
        try {
            await axios.put(`${API_BASE}/students/${studentId}`, {
                year_level: newYearLevel,
                semester: newSemester
            });
            setStudent({ ...student, year_level: newYearLevel, semester: newSemester });
            showToast('Year level and semester updated successfully');
            setEditingYearSem(false);
        } catch (err) {
            showToast('Failed to update year level and semester', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="asd-loading">
                <div className="asd-spinner">⟳</div>
                <p>Loading student details…</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="asd-error">
                <p>Student not found</p>
                <button onClick={() => navigate('/admin')} className="asd-back-btn">
                    ← Back to Students
                </button>
            </div>
        );
    }

    const getFullName = (u) => {
        if (!u) return '—';
        const parts = [u.first_name, u.middle_name, u.last_name].filter(Boolean);
        const name  = parts.join(' ');
        return u.suffix ? `${name} ${u.suffix}` : name;
    };

    return (
        <div className="asd-container">
            {/* Toast Notification */}
            {toast && (
                <div className={`asd-toast asd-toast-${toast.type}`}>
                    {toast.type === 'error' ? '✕ ' : '✓ '}{toast.message}
                </div>
            )}

            {/* Header */}
            <div className="asd-header">
                <button className="asd-back-btn" onClick={() => navigate('/admin')}>
                    ← Back to Students
                </button>
                <h1 className="asd-title">Student Profile</h1>
            </div>

            <div className="asd-grid">
                {/* Left Column: Profile Card */}
                <div className="asd-left">
                    <div className="asd-profile-card">
                        <div className="asd-avatar-large">
                            {student.user?.first_name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <h2 className="asd-name">{getFullName(student.user)}</h2>
                        <p className="asd-email">{student.user?.email}</p>
                        <p className="asd-id">Student ID: {student.student_id}</p>

                        {/* Status Badge */}
                        <div className="asd-status-section">
                            {editingStatus ? (
                                <div className="asd-status-edit">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="asd-status-select"
                                    >
                                        <option value="regular">✅ Regular</option>
                                        <option value="irregular">⚠️ Irregular</option>
                                    </select>
                                    <button
                                        className="asd-save-status"
                                        onClick={handleSaveStatus}
                                        disabled={submitting}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="asd-cancel-status"
                                        onClick={() => {
                                            setEditingStatus(false);
                                            setNewStatus(student.status);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="asd-status-display">
                                    <span
                                        className={`asd-status-badge ${student.status}`}
                                        style={{
                                            color: student.status === 'regular' ? '#22c55e' : '#ef4444'
                                        }}
                                    >
                                        {student.status === 'regular' ? '✅ Regular' : '⚠️ Irregular'}
                                    </span>
                                    <button
                                        className="asd-edit-status"
                                        onClick={() => setEditingStatus(true)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="asd-info-grid">
                            {editingYearSem ? (
                                <>
                                    <div className="asd-info-item">
                                        <label className="asd-info-label">Year Level</label>
                                        <select
                                            value={newYearLevel}
                                            onChange={(e) => setNewYearLevel(e.target.value)}
                                            className="asd-info-select"
                                        >
                                            <option value="1">Year 1</option>
                                            <option value="2">Year 2</option>
                                            <option value="3">Year 3</option>
                                            <option value="4">Year 4</option>
                                        </select>
                                    </div>
                                    <div className="asd-info-item">
                                        <label className="asd-info-label">Semester</label>
                                        <select
                                            value={newSemester}
                                            onChange={(e) => setNewSemester(e.target.value)}
                                            className="asd-info-select"
                                        >
                                            <option value="1">Semester 1</option>
                                            <option value="2">Semester 2</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1' }}>
                                        <button
                                            className="asd-save-status"
                                            onClick={handleSaveYearSem}
                                            disabled={submitting}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="asd-cancel-status"
                                            onClick={() => {
                                                setEditingYearSem(false);
                                                setNewYearLevel(student.year_level);
                                                setNewSemester(student.semester);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="asd-info-item">
                                        <span className="asd-info-label">Year Level</span>
                                        <span className="asd-info-value">Year {student.year_level}</span>
                                    </div>
                                    <div className="asd-info-item">
                                        <span className="asd-info-label">Semester</span>
                                        <span className="asd-info-value">Sem {student.semester}</span>
                                    </div>
                                    <div className="asd-info-item">
                                        <span className="asd-info-label">Course</span>
                                        <span className="asd-info-value">{student.course?.name ?? '—'}</span>
                                    </div>
                                    <button
                                        className="asd-edit-year-sem"
                                        onClick={() => setEditingYearSem(true)}
                                        style={{ gridColumn: '1 / -1' }}
                                    >
                                        ✏️ Edit Year/Semester
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Grades */}
                <div className="asd-right">
                    <div className="asd-grades-card">
                        <div className="asd-grades-header">
                            <h3>Subject Grades</h3>
                            {!editingGrades ? (
                                <button
                                    className="asd-edit-grades-btn"
                                    onClick={() => setEditingGrades(true)}
                                >
                                    ✏️ Edit Grades
                                </button>
                            ) : null}
                        </div>

                        {gradeForm.length === 0 ? (
                            <div className="asd-no-grades">
                                <p>No grades recorded yet</p>
                            </div>
                        ) : (
                            <>
                                <table className="asd-grades-table">
                                    <thead>
                                        <tr>
                                            <th>Subject Code</th>
                                            <th>Subject Name</th>
                                            <th>Units</th>
                                            <th>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gradeForm.map((grade, index) => (
                                            <tr key={grade.id} className="asd-grade-row">
                                                <td className="asd-code">{grade.subject_code}</td>
                                                <td className="asd-subject">{grade.subject_name}</td>
                                                <td className="asd-units">{grade.units}</td>
                                                <td className="asd-grade">
                                                    {editingGrades ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            value={grade.grade}
                                                            onChange={(e) => handleGradeChange(index, e.target.value)}
                                                            className="asd-grade-input"
                                                        />
                                                    ) : (
                                                        <span className="asd-grade-display">
                                                            {typeof grade.grade === 'number' 
                                                                ? grade.grade.toFixed(2) 
                                                                : grade.grade}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {editingGrades && (
                                    <div className="asd-grade-actions">
                                        <button
                                            className="asd-save-btn"
                                            onClick={handleSaveGrades}
                                            disabled={submitting}
                                        >
                                            💾 Save Changes
                                        </button>
                                        <button
                                            className="asd-cancel-btn"
                                            onClick={() => {
                                                setEditingGrades(false);
                                                fetchStudent();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentDetail;
