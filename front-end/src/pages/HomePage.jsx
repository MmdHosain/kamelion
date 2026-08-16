// src/pages/HomePage.jsx
import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import QuickNavSlider from '../components/sections/QuickNavSlider';
import BookingSection from '../components/sections/BookingSection';
import ReviewsSection from '../components/sections/ReviewsSection';
import ContactHoursSection from '../components/sections/ContactHoursSection';

const HomePage = ({ onOpenAppointment, onOpenChat }) => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pb-20">
      {/* 1. Hero Section */}
      <HeroSection
        onOpenAppointment={onOpenAppointment}
        onOpenChat={onOpenChat}
      />

      {/* 2. Quick Navigation Slider */}
      <QuickNavSlider />

      {/* 3. Online Booking & Calendar */}
      <BookingSection onOpenAppointment={onOpenAppointment} />

      {/* 4. Patient Reviews & Submission Form */}
      <ReviewsSection />

      {/* 5. Contact Info & Working Hours */}
      <ContactHoursSection />
    </main>
  );
};

export default HomePage;