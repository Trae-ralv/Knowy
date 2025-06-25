import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FacebookLoginButton } from "react-social-login-buttons";
import '../css/login.css';

function Login({ setIsAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Load Facebook SDK
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });
        };


        // Check if Facebook JSSDK is found
        if (!document.getElementById('facebook-jssdk')) {
            // create <script>
            const script = document.createElement('script');
            // assign <script> value
            script.id = 'facebook-jssdk';
            script.src = 'https://connect.facebook.net/en_US/sdk.js';

            //assign to in the <head>
            document.head.appendChild(script);
        }
    }, []);// run only once

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            setIsAuth(true);
            navigate('/', { replace: true });
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // Google OAuth Success handler
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            // Send Google ID token to your backend for verification
            const { credential } = credentialResponse;
            // Optionally decode for UI (not for security!)
            const decoded = jwtDecode(credential);
            console.log(decoded);
            const response = await axios.post(`${API_URL}/api/auth/google`, {
                idToken: credential,
            });
            localStorage.setItem('token', response.data.token); // Your backend's JWT
            setIsAuth(true);
            navigate('/', { replace: true });
        } catch (error) {
            setError('Google login failed');
            console.error('Google login error:', error);
        }
    };

    // Google OAuth Error handler
    const handleGoogleLoginError = () => {
        setError('Google login was unsuccessful. Please try again.');
    };

    const handleFacebookLoginClick = () => {
        if (!window.FB) {
            setError('Facebook SDK not loaded');
            return;
        }
        window.FB.login(function (response) {
            if (response.authResponse) {
                handleFacebookLoginResponse(response.authResponse);
            } else {
                setError('Facebook login was cancelled or failed');
            }
        }, { scope: 'email,public_profile' });
    };

    const handleFacebookLoginResponse = async (authResponse) => {
        try {
            const { accessToken } = authResponse;
            console.log(authResponse);
            if (accessToken) {
                const response = await axios.post(`${API_URL}/api/auth/facebook`, {
                    accessToken
                });
                localStorage.setItem('token', response.data.token);
                setIsAuth(true);
                navigate('/', { replace: true });
            } else {
                setError('Facebook login failed: No access token');
            }
        } catch (error) {
            setError('Facebook login failed');
            console.error('Facebook login error:', error);
        }
    };

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            setIsAuth(true);
            navigate('/', { replace: true });
        }
    }, [setIsAuth, navigate]);

    const toggleShowPassword = () => setShowPassword((prev) => !prev);

    return (
        <div className="body-container prevent-select">
            {error && (
                <div className="alert alert-danger text-center alert-float" role="alert">
                    {error}
                </div>
            )}
            <div className="container-fluid content">
                <div className="container login-container">
                    <h2 className="text-center mb-5 mt-3">Login to Your Account</h2>
                    <form onSubmit={handleLogin}>
                        {/* Email Input */}
                        <div className="mb-4">
                            <div className="form-floating">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                            <div className="form-check mt-3 ms-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="show-password"
                                    checked={showPassword}
                                    onChange={toggleShowPassword}
                                />
                                <label className="form-check-label" htmlFor="show-password">
                                    Show Password
                                </label>
                            </div>
                        </div>
                        {/* Register Link */}
                        <div className="d-flex justify-content-between align-items-center">
                            <p className='m-0'>
                                Don't have an account?
                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none"
                                    onClick={() => navigate('/register')}
                                >
                                    Register
                                </button>
                            </p>
                            <div className='m-0'>
                                <button
                                    type="submit"
                                    className="btn btn-primary fw-bold w-100 px-5 m-0"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="text-center">
                        <div>or</div>
                        <div className="d-flex justify-content-center mt-2">
                            <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={handleGoogleLoginError}
                                useOneTap
                            />
                        </div>
                        <div className="d-flex justify-content-center mt-0 ">
                            <FacebookLoginButton className='social-button' onClick={handleFacebookLoginClick} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="sub-container">
                <p className="ps-4">© 2025 ABC Condo. All Rights Reserved</p>
            </div>
        </div>
    );
}


export default Login;

