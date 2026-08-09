import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[420px] md:h-[456px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/fac624df-a6d0-4eea-a6ac-26782fd1ba69.png')" }}
      />
      <div className="absolute inset-0 bg-primary/60"></div>

      <div className="relative z-10 h-full max-w-6xl mx-auto px-4">
        <div className="h-full flex flex-col justify-center items-center md:items-start text-center md:text-right gap-3">
          <h1 className="text-white font-bold text-[28px] sm:text-[32px] md:text-[46px] drop-shadow-lg">
            دکتر نگار معشوری
          </h1>
          <p className="text-white font-light text-[18px] sm:text-[20px] md:text-[26px] drop-shadow-md">
            فلوشیپ جراحی پستان
          </p>
          <p className="text-white/90 font-light text-[16px] sm:text-[18px] md:text-[22px]">
            تخصص، دقت، آرامش در درمان
          </p>
          <div className="flex gap-4 mt-6 flex-wrap justify-center md:justify-start">
            <a
              href="https://drhamidahmadi.ir/contact/"
              className="bg-primary hover:bg-primaryLight text-white font-medium text-[15px] md:text-[16px] px-6 md:px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all"
            >
              ویزیت حضوری
            </a>
            <a
              href="https://web.whatsapp.com/send?phone=989212129902"
              className="bg-secondary hover:bg-[#d9b2bb] text-primary font-medium text-[15px] md:text-[16px] px-6 md:px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all border border-primary/10"
            >
              ویزیت آنلاین
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
