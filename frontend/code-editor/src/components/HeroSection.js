import React from 'react';
import '../css/HeroSection.css';
import { useNavigate } from "react-router-dom";

function HeroSection() {

    const navigate = useNavigate();
    const handleSignUp = () => {
        // redirect to FirebaseAuth.js
        navigate('/signup');
    }
    return (
        <div className="hero-container">
            <h1>Collaborate in Real-Time on Your Code Projects</h1>
            <p>Join the most efficient coding platform for teams.</p>
            <div className="hero-btns">
                <button className="btn-primary" onClick={handleSignUp}>Sign Up for Free</button>
            </div>
        </div>
    );
}

export default HeroSection;
