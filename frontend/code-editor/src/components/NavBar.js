import React from 'react';
import '../css/Navbar.css';
import withNavigation from '../hooks/withNavigation';

function Navbar({ navigate }) {
    const navigateToHome = () => {
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <a href="#home" className="nav-logo">CodeCollab</a>
                <ul className="nav-menu">
                    <li className="nav-item"><a onClick={navigateToHome} className="nav-links">Home</a></li>
                    <li className="nav-item"><a href="#feature" className="nav-links">Features</a></li>
                    <li className="nav-item"><a href="#pricing" className="nav-links">Pricing</a></li>
                    <li className="nav-item"><a href="#contact" className="nav-links">Contact Us</a></li>
                </ul>
            </div>
        </nav>
    );
}

export default withNavigation(Navbar);
