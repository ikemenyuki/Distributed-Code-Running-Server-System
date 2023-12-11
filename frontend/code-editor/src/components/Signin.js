import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../css/Signup.css'; // Reusing the same stylesheet as Signup for consistent styling
import logo from '../assets/logo.png';

const Signin = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignin = async (e) => {
        e.preventDefault();
        setError('');
        login(email, password).then(() => {
            // Navigate to the code editor page
            navigate('/code-editor');
        }).catch((err) => {
            setError('Failed to sign in, ' + err.message);
        });
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <img src={logo} alt="CodeCollab Logo" className="logo" />
            </header>
            <main className="signup-main">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form className="signup-form" onSubmit={handleSignin}>
                    <h1>Sign In</h1>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="signup-button">Sign In</button>
                    <p className="login-link">
                        Don't have an account? <a href="/signup">Sign Up</a>
                    </p>
                </form>
            </main>
        </div>
    );
}

export default Signin;
