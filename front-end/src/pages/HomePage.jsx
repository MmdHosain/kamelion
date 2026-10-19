// src/pages/HomePage.jsx
import React from 'react';
import SEO from '../components/seo/SEO';
import HeroSection from '../components/sections/HeroSection';
import QuickNavSlider from '../components/sections/QuickNavSlider';
import BookingSection from '../components/sections/BookingSection';
import ReviewsSection from '../components/sections/ReviewsSection';
import ContactHoursSection from '../components/sections/ContactHoursSection';

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'کلینیک تخصصی پستان دکتر نگار معشوری',
  url: 'https://kamelion.ir',
  logo: 'https://kamelion.ir/pink-ribbon.svg',
  image: 'https://kamelion.ir/pink-ribbon.svg',
  description:
    'کلینیک تخصصی تشخیص، درمان، انکوپلاستی و جراحی‌های پستان توسط دکتر نگار معشوری.',
  medicalSpecialty: ['SurgicalOncology', 'PlasticSurgery'],
  availableService: [
    { '@type': 'MedicalProcedure', name: 'جراحی انکوپلاستی و حفظ پستان' },
    { '@type': 'MedicalProcedure', name: 'ماموپلاستی، ماستوپکسی و زیبایی پستان' },
    { '@type': 'MedicalProcedure', name: 'غربالگری و سونوگرافی تخصصی پستان' },
  ],
  physician: {
    '@type': 'Physician',
    name: 'دکتر نگار معشوری',
    medicalSpecialty:
      'متخصص جراحی عمومی و فلوشیپ فوق‌تخصصی بیماری‌ها و جراحی پستان',
  },
};

const HomePage = ({ onOpenAppointment, onOpenChat }) => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pt-20 sm:pt-24 md:pt-28 pb-20 overflow-x-hidden">
      <SEO
        title="کلینیک تخصصی بیماری‌ها و جراحی پستان"
        description="کلینیک تخصصی دکتر نگار معشوری — ارائه خدمات تشخیصی، جراحی‌های انکوپلاستی، ماموپلاستی و درمان بیماری‌های خوش‌خیم و بدخیم پستان."
        url="/"
        schema={homeSchema}
      />
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