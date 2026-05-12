import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/StudentDashboard.css';

const API_BASE = 'http://localhost:8000/api';

const getFullName = (u) => {
    if (!u) return '—';
    const parts = [u.first_name, u.middle_name, u.last_name].filter(Boolean);
    const name = parts.join(' ');
    return u.suffix ? `${name} ${u.suffix}` : name;
};

const gradeInfo = (v) => {
    if (v === null || v === undefined || v === '') return { label: 'Not Graded', color: '#94a3b8', bg: '#f1f5f9', pct: 0 };
    const n = parseFloat(v);
    if (n >= 3.5) return { label: 'Excellent',  color: '#10b981', bg: '#ecfdf5', pct: Math.round((n / 5) * 100) };
    if (n >= 2.5) return { label: 'Good',        color: '#f59e0b', bg: '#fffbeb', pct: Math.round((n / 5) * 100) };
    if (n >= 1.0) return { label: 'Pass',         color: '#3b82f6', bg: '#eff6ff', pct: Math.round((n / 5) * 100) };
    return               { label: 'Incomplete',  color: '#ef4444', bg: '#fef2f2', pct: Math.round((n / 5) * 100) };
};

const average = (grades) => {
    const valid = grades.filter(g => g !== null && g !== undefined && g !== '');
    if (!valid.length) return null;
    return (valid.reduce((a, b) => a + parseFloat(b), 0) / valid.length).toFixed(2);
};

const Toast = ({ message, type }) => (
    <div className="sp-toast" data-type={type}>
        {type === 'error' ? '✕' : '✓'} {message}
    </div>
);

/* ─────────────────────────────────────────────
   OVERVIEW SECTION (full-width, no narrow card)
───────────────────────────────────────────── */
const OverviewTab = ({ student, avg, avgInfo, firstName, getSemesterName, setActiveTab }) => {
    const statCards = [
        {
            icon: '📅',
            label: 'Year Level',
            value: `Year ${student?.year_level ?? '—'}`,
            iconBg: '#eef2ff',
        },
        {
            icon: '📆',
            label: 'Semester',
            value: getSemesterName(student?.semester),
            iconBg: '#f0fdf4',
        },
        {
            icon: '📋',
            label: 'Status',
            value: student?.status === 'regular' ? '✅ Regular' : '⚠️ Irregular',
            iconBg: '#ecfdf5',
            color: student?.status === 'regular' ? '#059669' : '#ef4444',
        },
        {
            icon: '📚',
            label: 'Subjects',
            value: student?.grades?.length ?? '—',
            iconBg: '#eef2ff',
            color: '#4f46e5',
        },
    ];

    const quickActions = [
        {
            icon: '📊', iconBg: '#eef2ff',
            label: 'View Grades',
            desc: 'Check all subjects and semester GWA',
            tab: 'grades',
        },
        {
            icon: '👤', iconBg: '#f0f9ff',
            label: 'My Profile',
            desc: 'Review your enrollment information',
            tab: 'profile',
        },
        {
            icon: '🔐', iconBg: '#fdf4ff',
            label: 'Security',
            desc: 'Change your account password',
            tab: 'profile',
        },
    ];

    const cardBase = {
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '20px',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Row 1 — 4 stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {statCards.map(s => (
                    <div key={s.label} style={cardBase}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>
                            {s.icon}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                            {s.label}
                        </div>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: s.color ?? '#1a1a2e' }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2 — GwA banner + Course card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px' }}>

                {/* GWA */}
                <div style={{ background: '#1e1b4b', borderRadius: 14, padding: '26px 28px', display: 'flex', alignItems: 'center', gap: 28 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1, flexShrink: 0 }}>
                        {avg ?? '—'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                            Overall GWA
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#a5f3c0', marginBottom: 14 }}>
                            {avg ? `${avgInfo.label} standing ✓` : 'No grades yet'}
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: avg ? `${(parseFloat(avg) / 5) * 100}%` : '0%',
                                background: '#6ee7b7',
                                borderRadius: 99,
                                transition: 'width 0.9s ease',
                            }} />
                        </div>
                    </div>
                </div>

                {/* Course info */}
                <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                            🎓
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4 }}>
                                {student?.course?.name ?? '—'}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                                Leyte Normal University
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#eef2ff', color: '#4f46e5' }}>
                            2024 – 2025
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#ecfdf5', color: '#059669' }}>
                            ✅ Enrolled
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', color: '#475569' }}>
                            {getSemesterName(student?.semester)} Sem
                        </span>
                    </div>
                </div>
            </div>

            {/* Row 3 — Quick action cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {quickActions.map(a => (
                    <button
                        key={a.label}
                        onClick={() => setActiveTab(a.tab)}
                        style={{
                            ...cardBase,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#4f46e5';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
                            {a.icon}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 5 }}>
                            {a.label}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>
                            {a.desc}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            Go to {a.label} →
                        </div>
                    </button>
                ))}
            </div>

            {/* Row 4 — Notice */}
            <div style={{ borderLeft: '3px solid #bae6fd', background: '#f0f9ff', padding: '13px 16px', fontSize: 13, color: '#0284c7', lineHeight: 1.6, borderRadius: '0 8px 8px 0' }}>
                <strong style={{ display: 'block', color: '#0369a1', marginBottom: 2 }}>Need help with your records?</strong>
                For grade concerns or enrollment updates, coordinate with your school administrator or registrar.
            </div>

        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [student, setStudent]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [toast, setToast]               = useState(null);
    const [activeTab, setActiveTab]       = useState('overview');
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');
        if (!token || role !== 'student') { localStorage.clear(); navigate('/'); return; }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [navigate]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/student/profile`);
            setStudent(res.data);
        } catch (err) {
            if (err.response?.status === 401) { localStorage.clear(); navigate('/'); }
            else showToast('Failed to load profile.', 'error');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleLogout = async () => {
        try { await axios.post(`${API_BASE}/logout`); } catch (_) {}
        delete axios.defaults.headers.common['Authorization'];
        localStorage.clear();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            showToast('New passwords do not match', 'error');
            return;
        }
        try {
            await axios.post(`${API_BASE}/change-password`, {
                current_password:      passwordForm.current,
                password:              passwordForm.new,
                password_confirmation: passwordForm.confirm,
            });
            showToast('Password changed successfully!', 'success');
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        }
    };

    const grades    = student ? student.grades.map(g => g.grade) : [];
    const avg       = average(grades);
    const fullName  = getFullName(student?.user);
    const firstName = student?.user?.first_name ?? 'Student';
    const avgInfo   = gradeInfo(avg);

    const getSemesterName = (sem) => {
        if (!sem) return 'Unknown';
        const s = String(sem);
        if (s.includes('1') || s === '1') return 'First';
        if (s.includes('2') || s === '2') return 'Second';
        if (s.includes('3') || s === '3') return 'Third';
        if (s.includes('4') || s === '4') return 'Fourth';
        return s;
    };

    const groupedGrades = () => {
        if (!student?.grades?.length) return [];
        const groups = {};
        student.grades.forEach(g => {
            const yr  = g.subject?.year_level ?? 'Unknown';
            const sem = getSemesterName(g.subject?.semester?.name ?? g.subject?.semester);
            const key = `${yr}||${sem}`;
            if (!groups[key]) groups[key] = { yearLevel: yr, semester: sem, rows: [] };
            groups[key].rows.push(g);
        });
        return Object.values(groups).sort((a, b) => {
            if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
            return String(a.semester).localeCompare(String(b.semester));
        });
    };

    if (loading) return (
        <div className="sp-loading">
            <div className="sp-loading-ring" />
            <p className="sp-loading-text">Loading your portal…</p>
        </div>
    );

    const navTabs = [
        { id: 'overview', label: 'Overview', icon: '⌂' },
        { id: 'grades',   label: 'Grades',   icon: '◎' },
        { id: 'profile',  label: 'Profile',  icon: '◉' },
    ];

    return (
        <div className="sp-root">
            {toast && <Toast {...toast} />}

            {/* ── TOP NAV ── */}
            <nav className="sp-nav">
                <div className="sp-nav-inner">
                    <div className="sp-nav-brand">
                        <div className="sp-nav-logo">LNU</div>
                        <div>
                            <div className="sp-nav-title">Leyte Normal University</div>
                            <div className="sp-nav-sub">Student Portal</div>
                        </div>
                    </div>

                    <div className="sp-nav-tabs">
                        {navTabs.map(t => (
                            <button
                                key={t.id}
                                className={`sp-nav-tab${activeTab === t.id ? ' active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                <span className="sp-tab-icon">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="sp-nav-right">
                        <div className="sp-nav-avatar">{firstName.charAt(0).toUpperCase()}</div>
                        <button className="sp-nav-logout" onClick={handleLogout}>Sign out</button>
                    </div>
                </div>
            </nav>

            {/* ── HERO BANNER ── */}
            <div className="sp-hero">
                <div className="sp-hero-inner">
                    <div className="sp-hero-text">
                        <p className="sp-hero-eyebrow">
                            {activeTab === 'overview' && 'Welcome back'}
                            {activeTab === 'grades'   && 'Academic Records'}
                            {activeTab === 'profile'  && 'My Information'}
                        </p>
                        <h1 className="sp-hero-title">
                            {activeTab === 'overview' && `Hello, ${firstName} 👋`}
                            {activeTab === 'grades'   && 'My Grades'}
                            {activeTab === 'profile'  && fullName}
                        </h1>
                        <div className="sp-hero-chips">
                            {student?.student_id && (
                                <span className="sp-hero-chip sp-chip-id">🪪 {student.student_id}</span>
                            )}
                            <span className="sp-hero-chip">{student?.course?.name ?? '—'}</span>
                            <span className="sp-hero-chip">📚 Year {student?.year_level} · {getSemesterName(student?.semester)} Sem</span>
                        </div>
                    </div>
                    <div className="sp-hero-deco">
                        <div className="sp-hero-circle sp-hero-c1" />
                        <div className="sp-hero-circle sp-hero-c2" />
                        <div className="sp-hero-gpa-bubble">
                            <div className="sp-bubble-label">GWA</div>
                            <div className="sp-bubble-value">{avg ?? '—'}</div>
                            <div className="sp-bubble-sub">{avg ? avgInfo.label : 'No grades yet'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PAGE BODY ── */}
            <div className="sp-body">

                {/* ══ OVERVIEW ══ */}
                {activeTab === 'overview' && (
                    <OverviewTab
                        student={student}
                        avg={avg}
                        avgInfo={avgInfo}
                        firstName={firstName}
                        getSemesterName={getSemesterName}
                        setActiveTab={setActiveTab}
                    />
                )}

                {/* ══ GRADES ══ */}
                {activeTab === 'grades' && (
                    <div className="sp-grades-page">
                        {student?.grades && student.grades.length > 0 ? (
                            <>
                                {groupedGrades().map(({ yearLevel, semester, rows }) => {
                                    const limitedRows   = rows.slice(0, 9);
                                    const semTotalUnits = limitedRows.reduce((s, g) => s + parseFloat(g.subject?.units ?? 0), 0);
                                    const gradedRows    = limitedRows.filter(g => {
                                        const fg = g.final_grade ?? g.grade;
                                        return fg !== null && fg !== undefined && fg !== '';
                                    });
                                    const semGwa = gradedRows.length > 0
                                        ? (gradedRows.reduce((s, g) => s + parseFloat(g.final_grade ?? g.grade), 0) / gradedRows.length).toFixed(2)
                                        : null;
                                    const semGwaInfo = gradeInfo(semGwa);

                                    const semLabel = (() => {
                                        const s = String(semester);
                                        if (s.includes('1') || s === '1') return 'First';
                                        if (s.includes('2') || s === '2') return 'Second';
                                        if (s.includes('3') || s === '3') return 'Third';
                                        if (s.includes('4') || s === '4') return 'Fourth';
                                        return s;
                                    })();

                                    return (
                                        <div key={`${yearLevel}-${semester}`} style={{ marginBottom: '32px' }}>
                                            {/* Block header */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                                                        Year {yearLevel}
                                                    </span>
                                                    <span style={{ color: '#cbd5e1' }}>·</span>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                                                        {semLabel} Semester
                                                    </span>
                                                </div>
                                                {semGwa && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                            Semester GWA
                                                        </span>
                                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 800, color: semGwaInfo.color, background: semGwaInfo.bg, padding: '3px 12px', borderRadius: '20px' }}>
                                                            {semGwa}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Table */}
                                            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                <table className="sp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f8fafc' }}>
                                                            <th className="sp-th">Subject Code</th>
                                                            <th className="sp-th">Description</th>
                                                            <th className="sp-th sp-th-center">Units</th>
                                                            <th className="sp-th sp-th-center">Final Grade</th>
                                                            <th className="sp-th sp-th-center">Remarks</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {limitedRows.map((grade) => {
                                                            const fg   = grade.final_grade ?? grade.grade;
                                                            const info = gradeInfo(fg);
                                                            return (
                                                                <tr
                                                                    key={grade.id}
                                                                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                                                                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                                                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                                                >
                                                                    <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                                                                        <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: "'Sora', sans-serif" }}>
                                                                            {grade.subject?.code ?? '—'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                                                                        {grade.subject?.description ?? grade.subject?.name ?? '—'}
                                                                    </td>
                                                                    <td style={{ padding: '16px 20px', fontSize: '14px', textAlign: 'center', color: '#64748b' }}>
                                                                        {grade.subject?.units ?? '—'}
                                                                    </td>
                                                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 700, color: info.color }}>
                                                                            {fg !== null && fg !== undefined && fg !== ''
                                                                                ? parseFloat(fg).toFixed(2) : '—'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: info.color, background: info.bg }}>
                                                                            {grade.remarks ?? info.label}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr style={{ background: '#f0f4ff', borderTop: '2px solid #e0e7ff' }}>
                                                            <td colSpan={2} style={{ padding: '14px 20px', fontWeight: 700, color: '#4f46e5', fontSize: '13px' }}>
                                                                Total Units / Semester GWA
                                                            </td>
                                                            <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: '#4f46e5', fontSize: '13px' }}>
                                                                {semTotalUnits.toFixed(1)}
                                                            </td>
                                                            <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: '#4f46e5', fontSize: '13px' }}>
                                                                {semGwa ?? '—'}
                                                            </td>
                                                            <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: semGwaInfo.color, fontSize: '13px' }}>
                                                                {semGwa ? semGwaInfo.label : '—'}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="sp-no-data">
                                <div className="sp-no-data-icon">📭</div>
                                <div className="sp-no-data-title">No grades yet</div>
                                <div className="sp-no-data-sub">
                                    Your grades will appear here once they're entered by your instructor.
                                </div>
                            </div>
                        )}

                        <div className="sp-notice">
                            <span>📋</span>
                            <div>
                                <strong>Grades are managed by your administrator.</strong>
                                <p>For grade disputes or concerns, please contact your school registrar.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ PROFILE ══ */}
                {activeTab === 'profile' && (
                    <div className="sp-profile-page">
                        <div className="sp-profile-grid">

                            {/* Identity card */}
                            <div className="sp-id-card">
                                <div className="sp-id-card-bg" />
                                <div className="sp-id-avatar">{firstName.charAt(0).toUpperCase()}</div>
                                <div className="sp-id-name">{fullName}</div>
                                <div className="sp-id-email">{student?.user?.email}</div>
                                <div className="sp-id-num">{student?.student_id ?? '—'}</div>
                                <div className="sp-id-chips">
                                    <span className="sp-id-chip">{student?.course?.name ?? '—'}</span>
                                </div>
                            </div>

                            {/* Right column */}
                            <div>
                                {/* Enrollment details */}
                                <div className="sp-profile-details">
                                    <h3 className="sp-details-title">Enrollment Information</h3>
                                    <div className="sp-details-grid">
                                        {[
                                            { label: 'Student ID',  value: student?.student_id,               icon: '🪪' },
                                            { label: 'First Name',  value: student?.user?.first_name,         icon: '👤' },
                                            { label: 'Middle Name', value: student?.user?.middle_name || '—', icon: '👤' },
                                            { label: 'Last Name',   value: student?.user?.last_name,          icon: '👤' },
                                            { label: 'Suffix',      value: student?.user?.suffix || '—',      icon: '👤' },
                                            { label: 'Email',       value: student?.user?.email,              icon: '✉️' },
                                            { label: 'Course',      value: student?.course?.name,             icon: '📚' },
                                            {
                                                label: 'Status',
                                                value: student?.status
                                                    ? (student.status === 'regular' ? '✅ Regular' : '⚠️ Irregular')
                                                    : 'Pending',
                                                icon: '📋',
                                            },
                                        ].map((f) => (
                                            <div key={f.label} className="sp-detail-row">
                                                <div className="sp-detail-icon-wrap">{f.icon}</div>
                                                <div className="sp-detail-content">
                                                    <div className="sp-detail-label">{f.label}</div>
                                                    <div className="sp-detail-val">{f.value ?? '—'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="sp-notice" style={{ marginTop: '20px' }}>
                                        <span>🔒</span>
                                        <div>
                                            <strong>Your information is protected.</strong>
                                            <p>To update your details, coordinate with your school administrator.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Change password */}
                                <div style={{ marginTop: '28px' }}>
                                    <h3 className="sp-details-title">Account Security</h3>
                                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginTop: 0, marginBottom: '18px' }}>
                                            Change Password
                                        </h4>
                                        <form onSubmit={handleChangePassword}>
                                            <div className="sp-form-group">
                                                <label>Current Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.current}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                    placeholder="Enter your current password"
                                                    required
                                                />
                                            </div>
                                            <div className="sp-form-group">
                                                <label>New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.new}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                            </div>
                                            <div className="sp-form-group">
                                                <label>Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirm}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="sp-security-btn">
                                                Update Password
                                            </button>
                                        </form>

                                        <div className="sp-security-tips" style={{ marginTop: '20px' }}>
                                            <h3>🛡️ Security Tips</h3>
                                            <ul>
                                                <li>Use uppercase, lowercase, numbers, and symbols</li>
                                                <li>Never share your password with anyone</li>
                                                <li>Change your password regularly</li>
                                                <li>Sign out after each session on shared devices</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentDashboard;