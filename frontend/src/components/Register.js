import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/login.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
                username: formData.username,
                password: formData.password,
                email: formData.email
            });

            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body-container prevent-select">
            {/* Error Message */}
            {error && (
                <div className="alert alert-danger text-center alert-float" role="alert">
                    {error}
                </div>
            )}
            <div className="container-fluid content">
                <div className="container login-container">
                    <h2 className="text-center mb-5 mt-3">Create an Account</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Username Input */}
                        <div className="mb-4">
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="username">Username</label>
                            </div>
                        </div>
                        {/* Email Input */}
                        <div className="mb-4">
                            <div className="form-floating">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="email">Email</label>
                            </div>
                        </div>
                        {/* Password Input */}
                        <div className="mb-4">
                            <div className="form-floating">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                        </div>
                        {/* Confirm Password Input */}
                        <div className="mb-4">
                            <div className="form-floating">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="confirmPassword">Confirm Password</label>
                            </div>
                            <div className="form-check mt-3 ms-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="show-password"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                />
                                <label className="form-check-label" htmlFor="show-password">
                                    Show Password
                                </label>
                            </div>
                        </div>

                        {/* Login Navigation */}
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <p>
                                    Already have an account?
                                    <button
                                        type="button"
                                        className="btn btn-link text-decoration-none"
                                        onClick={() => navigate('/login')}
                                    >
                                        Login
                                    </button>
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="sub-container">
                <p className="ps-4">© 2025 ABC Condo Community. All Rights Reserved</p>
            </div>
        </div>
    );
}

export default Register;