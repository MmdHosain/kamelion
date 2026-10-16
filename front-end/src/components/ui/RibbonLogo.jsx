import React from 'react';
import pinkRibbon from '../../assets/pink-ribbon.svg';

const RibbonLogo = ({ className = 'w-7 h-7', alt = 'دکتر نگار معشوری' }) => {
  return (
    <img
      src={pinkRibbon}
      alt={alt}
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
};

export default RibbonLogo;
