import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const THEMES_LIST = [
  { gradient: 'from-[#e75480] to-[#ba2d63]', text: 'text-[#ba2d63]' }, // Pink
  { gradient: 'from-[#b685c2] to-[#7d4a99]', text: 'text-[#7d4a99]' }, // Lilac
  { gradient: 'from-[#7d4a99] to-[#e75480]', text: 'text-[#7d4a99]' }  // Purple
];

export default function CommentsSlider({ comments = [] }) {
  if (!comments.length) return null;

  return (
    <div className="w-full py-16 bg-white/50">
      <h2 className="text-2xl font-bold text-center text-primary mb-10">
        نظر مراجعین
      </h2>

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        autoplay={{ delay: 2500 }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 2.5,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="w-5/6 max-w-5xl mx-auto"
      >
        {comments.map((c, i) => {
          const t = THEMES_LIST[i % THEMES_LIST.length];
          return (
          <SwiperSlide
            key={i}
            className="bg-white rounded-3xl p-6 shadow-lg
                       w-[330px] md:w-[420px] !h-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xl font-bold text-white`}>
                {c.name[0]}
              </div>
              <div>
                <p className={`${t.text} text-lg font-semibold`}>{c.name}</p>
                <p className="text-sm text-gray-500">{c.role || "مراجع"}</p>
              </div>
            </div>

            <p className="text-md text-textDark leading-relaxed mb-8">{c.text}</p>
          </SwiperSlide>
        )})}
      </Swiper>
    </div>
  );
}
