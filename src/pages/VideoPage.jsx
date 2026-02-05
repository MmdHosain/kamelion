export default function VideoPage({ onBack }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#6B6E6C] px-4 py-10 dir-rtl">

      {/* Header of Video Page */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2F5D50]">
          ویدیوها
        </h1>

        <button
          onClick={onBack}
          className="text-sm text-[#2F5D50] hover:underline"
        >
          ← بازگشت
        </button>
      </div>

      {/* Videos */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Video 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="aspect-video rounded-xl overflow-hidden mb-3">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="ویدیو معرفی"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-[#2F5D50] font-medium">
            معرفی خدمات
          </p>
        </div>
        
        {/* Video 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="aspect-video rounded-xl overflow-hidden mb-3">
            <video
              controls
              className="w-full h-full rounded-xl"
              src="/videos/-3071497865228685730.mp4"
            />
          </div>
          <p className="text-sm text-[#2F5D50] font-medium">
           خطرات ماموگرافی
          </p>
        </div>

        {/* Video 2 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="aspect-video rounded-xl overflow-hidden mb-3">
            <video
              controls
              className="w-full h-full rounded-xl"
              src="/videos/7537779331744502783.mp4"
            />
          </div>
          <p className="text-sm text-[#2F5D50] font-medium">
            آیا افرادی که سابقه سرطان پستان داشته اند اجازه بارداری دارند؟
          </p>
        </div>

      </div>
    </div>
  );
}
