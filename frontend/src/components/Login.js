import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [error, setError]               = useState('');
    const [loading, setLoading]           = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [eyeClass, setEyeClass]         = useState('');
    const eyeTimeout                      = useRef(null);
    const navigate = useNavigate();

    const togglePassword = () => {
        const next = !showPassword;
        setShowPassword(next);

        // Trigger bounce animation
        if (eyeTimeout.current) clearTimeout(eyeTimeout.current);
        setEyeClass(next ? 'eye-pop' : 'eye-hide');
        eyeTimeout.current = setTimeout(() => setEyeClass(''), 380);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email,
                password,
            });
            const token = response.data.access_token;
            const role  = response.data.role;

            if (token && role) {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('user_first_name', response.data.user.first_name);
                setTimeout(() => {
                    if (role === 'admin') navigate('/admin-dashboard');
                    else                  navigate('/student-dashboard');
                }, 100);
            } else {
                setError('Login successful, but account role is missing.');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('The email or password you entered is incorrect.');
            } else {
                setError('Could not connect to the server. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-root">
            {/* Floating background blobs */}
            <div className="login-blob login-blob-1" />
            <div className="login-blob login-blob-2" />
            <div className="login-blob login-blob-3" />

            <div className="login-layout">

                {/* ══ LEFT PANEL ══ */}
                <div className="login-left-panel">
                    <div className="login-brand-wrap">
                        {/* Gold crest */}
                        <div className="login-logo-ring">
                            <span className="login-logo-text">LNU</span>
                        </div>
                        <h1 className="login-brand-title">
                            Leyte Normal<br />University
                        </h1>
                        <p className="login-brand-sub">
                            Shaping futures through quality education since 1921.
                        </p>
                    </div>

                    <div className="login-feature-list">
                        {[
                            { icon: '📊', label: 'View your academic grades anytime, anywhere.' },
                            { icon: '🎓', label: 'Track your enrollment status and progress.' },
                            { icon: '🔒', label: 'Secure, private, and protected portal.' },
                        ].map((f, i) => (
                            <div key={i} className="login-feature-item">
                                <span className="login-feature-icon">{f.icon}</span>
                                <span className="login-feature-label">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    <p className="login-brand-footer">
                        © 2026 Leyte Normal University · All rights reserved
                    </p>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div className="login-right-panel">
                    <div className="login-card">

                        {/* Card header */}
                        <div className="login-card-top">
                            <div className="login-card-logo">LNU</div>
                            <div>
                                <h2 className="login-card-title">Welcome back</h2>
                                <p className="login-card-sub">Sign in to your portal</p>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="login-error-box">
                                <span className="login-error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="login-form">

                            {/* Email */}
                            <div className="login-field-wrap">
                                <label className="login-label">Email Address</label>
                                <div className="login-input-wrap">
                                    <span className="login-input-icon">✉️</span>
                                    <input
                                        type="email"
                                        placeholder="yourname@lnu.edu.ph"
                                        className="login-input"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="login-field-wrap">
                                <label className="login-label">Password</label>
                                <div className="login-input-wrap">
                                    <span className="login-input-icon">🔑</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        className="login-input login-input-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />

                                    {/* Animated SVG eye button */}
                                    <button
                                        type="button"
                                        className={`login-eye-btn ${eyeClass}`}
                                        onClick={togglePassword}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            /* Eye OPEN — click to hide */
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        ) : (
                                            /* Eye CLOSED — click to show */
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="login-submit-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? <span className="login-spinner" />
                                    : <>Sign In &nbsp;→</>
                                }
                            </button>
                        </form>

                        <div className="login-divider">
                            <span className="login-divider-line" />
                            <span className="login-divider-text">need help?</span>
                            <span className="login-divider-line" />
                        </div>

                        <p className="login-help-text">
                            Contact your <strong>school administrator</strong> or the<br />
                            Registrar's Office to reset your password.
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;