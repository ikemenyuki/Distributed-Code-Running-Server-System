import React from 'react';
import '../css/TestimonialsSection.css'; // Importing the CSS file for TestimonialsSection

function TestimonialsSection() {
    return (
        <div className="testimonials-container">
            <h2>What Our Users Say</h2>
            <div className="testimonials-wrapper">
                <div className="testimonial-item">
                    <p>"CodeCollab has revolutionized the way our team works. It's intuitive and efficient."</p>
                    <label>- Alex Smith, Software Developer</label>
                </div>
                <div className="testimonial-item">
                    <p>"The real-time collaboration feature is a game changer for remote teams."</p>
                    <label>- Jamie Doe, Project Manager</label>
                </div>
                <div className="testimonial-item">
                    <p>"I love how easy it is to integrate with our existing tools and workflows."</p>
                    <label>- Casey Johnson, Web Designer</label>
                </div>
            </div>
        </div>
    );
}

export default TestimonialsSection;
