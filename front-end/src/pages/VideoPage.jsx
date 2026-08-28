import React, { useState, useEffect } from "react";
import { videoService } from "../api/videoService";

const DEFAULT_VIDEOS = [
  {
    id: 1,
    type: "iframe",
    src: "https://www.youtube.com/embed/VIDEO_ID",
    title: "ویدیو معرفی خدمات",
  },
  {
    id: 2,
    type: "video",
    src: "/videos/-3071497865228685730.mp4",
    title: "خطرات ماموگرافی چیست؟",
  },
  {
    id: 3,
    type: "video",
    src: "/videos/7537779331744502783.mp4",
    title: "آیا افراد با سابقه سرطان پستان می‌توانند باردار شوند؟",
  },
  {
    id: 4,
    type: "video",
    src: "/videos/-9054488578247146232.mp4",
    title: "پروتز",
  },
];

export default function VideoPage({ onBack }) {
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);

  useEffect(() => {
    let isMounted = true;

    videoService
      .getVideos()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((v, i) => ({
            id: v.id || i,
            type: v.type || (v.src && v.src.includes('embed') ? 'iframe' : 'video'),
            src: v.src || v.url || v.video_url || '',
            title: v.title || 'ویدیو آموزشی',
          }));
          setVideos(formatted);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_VIDEOS
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-lightText text-primary px-6 py-12 dir-rtl">

      {/* top header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          گالری ویدیوها
        </h1>

        <button
          onClick={onBack}
          className="flex items-center gap-1 text-primary hover:text-primaryHover transition-all duration-300 font-medium hover:gap-2"
        >
          بازگشت

          {/* SVG Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="transition-transform group-hover:-translate-x-1 stroke-primary"
          >
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* videos grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {videos.map((video, index) => (
          <div
            key={index}
            className="
              bg-white rounded-2xl shadow-md p-4 border border-secondary/30 
              transition-all duration-500
            "
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">

              {/* video / iframe */}
              {video.type === "iframe" ? (
                <iframe
                  className="w-full h-full object-cover"
                  src={video.src}
                  title={video.title}
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                  src={video.src}
                />
              )}
            </div>

            <p className="text-sm text-primary font-medium mt-3 text-center">
              {video.title}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}
