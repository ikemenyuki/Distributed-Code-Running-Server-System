import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';

const Homepage = () => {
    return (
        <div>
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <Footer />
        </div>
    );
}

export default Homepage;