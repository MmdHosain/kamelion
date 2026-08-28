export default function StatsSection() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

        <div className="p-6 rounded-3xl bg-lightText shadow-sm">
          <div className="text-3xl font-extrabold text-primary">۹۸٪</div>
          <h2 className="text-primary text-lg font-semibold mt-2">رضایت</h2>
          <p className="text-sm mt-1">
             مراجعین از <b>تجربه</b> خود
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-lightText shadow-sm">
          <div className="text-3xl font-extrabold text-primary">173</div>
          <h2 className="text-primary text-lg font-semibold mt-2">
            جراحی موفق
          </h2>
          <p className="text-sm mt-1">
            در طول بیش از <b>۱۰</b>سال تجربه کاری 
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-lightText shadow-sm">
          <div className="text-3xl font-extrabold text-primary">+۱۹</div>
          <h2 className="text-primary text-lg font-semibold mt-2">
            مقالات
          </h2>
          <p className="text-sm mt-1">
            تالیف شده در حوزه جراحی پستان
          </p>
        </div>

      </div>
    </section>
  );
}

