import React from 'react';
import '../css/Signup.css';
import logo from '../assets/logo.png';
import { AuthContext } from '../context/AuthContext';
import { useContext, useState } from 'react';
import { NavigationType, useNavigate } from 'react-router-dom';

const Signup = () => {
    const { signup } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        signup(email, password).then((user) => {
            // Navigate to the code editor page
            navigate('/code-editor')
        }).catch((err) => {
            setError('Failed to create an account, ' + err.message);
        });
        ;
    };
    return (
        <div className="signup-container">
            <header className="signup-header">
                <img src={logo} alt="CodeCollab Logo" className="logo" />
            </header>
            <main className="signup-main">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form className="signup-form" onSubmit={handleSignup}>
                    <h1>Sign Up</h1>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        {password !== confirmPassword ? <a style={{ color: 'red' }}>It does not match with password.</a> : null}
                    </div>
                    <button type="submit" className="signup-button">Sign Up</button>
                    <p className="login-link">
                        Already have an account? <a href="/signin">Log In</a>
                    </p>
                </form>
            </main>
        </div>
    );
}

export default Signup;
