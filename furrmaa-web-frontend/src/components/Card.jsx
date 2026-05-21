export default function Card({ pet = "dog" }) {
  const firstImage =
    pet === "dog" ? "/images/c1.png" : "/images/c1-2.png";

  return (
    <section className="w-full py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FIRST CARD – changes */}
        <div
          className="
            h-[260px]
            rounded-2xl
            overflow-hidden
            grid
            grid-cols-1
            sm:grid-cols-2
            items-center
            bg-cover
            bg-center
          "
          style={{ backgroundImage: `url(${firstImage})` }}
        />

        {/* SECOND CARD – fixed */}
        <div
          className="
            h-[260px]
            rounded-2xl
            overflow-hidden
            grid
            grid-cols-1
            sm:grid-cols-2
            items-center
            bg-cover
            bg-center
          "
          style={{ backgroundImage: "url('/images/c2.png')" }}
        />

      </div>
    </section>
  );
}
