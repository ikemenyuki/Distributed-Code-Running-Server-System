import React from 'react';
import '../css/FeaturesSection.css'; // Importing the CSS file for FeaturesSection

function FeaturesSection() {
    return (
        <div className="features-container">
            <h2>Why Choose CodeCollab?</h2>
            <div className="features-wrapper">
                <div className="feature-item">
                    <h3>Real-Time Collaboration</h3>
                    <p>Work together with your team in real-time, seamlessly and efficiently.</p>
                </div>
                <div className="feature-item">
                    <h3>Intuitive Interface</h3>
                    <p>A user-friendly interface that makes coding and collaboration easy and enjoyable.</p>
                </div>
                <div className="feature-item">
                    <h3>Secure and Reliable</h3>
                    <p>Top-notch security to ensure your code and data are always safe.</p>
                </div>
            </div>
        </div>
    );
}

export default FeaturesSection;
