import React from 'react';
import '../css/Footer.css'; // Importing the CSS file for Footer

function Footer() {
    return (
        <div className="footer-container">
            <div className="footer-links">
                <div className="footer-link-wrapper">
                    <div className="footer-link-items">
                        <h2>About Us</h2>
                        <a href="/sign-up">How it works</a>
                        <a href="/">Testimonials</a>
                        <a href="/">Careers</a>
                        <a href="/">Terms of Service</a>
                    </div>
                </div>
                <div className="footer-link-wrapper">
                    <div className="footer-link-items">
                        <h2>Social Media</h2>
                        <a href="/">Instagram</a>
                        <a href="/">Facebook</a>
                        <a href="/">YouTube</a>
                        <a href="/">Twitter</a>
                    </div>
                </div>
                <div className="footer-link-wrapper">
                    <div className="footer-link-items">
                        <h2>Contact Us</h2>
                        <a href="/">Contact</a>
                        <a href="/">Support</a>
                        <a href="/">Destinations</a>
                        <a href="/">Sponsorships</a>
                    </div>
                </div>
            </div>
            <section className="social-media">
                <div className="social-media-wrap">
                    <small className="website-rights">CodeCollab © 2023</small>
                    <div className="social-icons">
                        {/* Social icons can be added here */}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Footer;
