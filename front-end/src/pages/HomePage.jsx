// src/pages/HomePage.jsx
import React from 'react';
import HeroSection from '../components/sections/HeroSection'; // Ensure this imports the correct HeroSection
import ServicesSection from '../components/sections/ServicesSection';
import AboutSection from '../components/sections/AboutSection';
import { COMMENTS } from '../data/commentsSlider'; // Ensure path is correct
import CommentsSlider from '../components/sections/CommentsSlider'
import StatsSection from "../components/sections/StatsSection";

const HomePage = () => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pb-40">
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <AboutSection />
      <CommentsSlider comments={COMMENTS} />
    </main>
  );
};

export default HomePage;