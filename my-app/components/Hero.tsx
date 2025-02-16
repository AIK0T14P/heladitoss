import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative md:h-[600px] h-[100vw] w-full flex items-center justify-center text-center text-white py-0 px-3 -mt-10">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-transparent z-10" />
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent z-10" />
        <div className="relative w-full h-full">
          <Image
            className="md:object-cover object-cover"
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGCOzg_sx8lw__HNmUJfV07MFobWmmuejuKOQ5cggDiAFHUauK1m71wRj07IRw-7qn9ugbVXBo46w3e8nQymr4w22-KoBaDTv9LYzr_shhohNi3GbHmrFl-JAgBCYKpJmYJNtJCHqnDRYJ2ZBArE_hUKqkXumNAgQnTCwmT9n13C2kBBPJzHVLg7w7N7Lv/s1252/pixelcut-export.jpeg"
            alt="Ice cream background"
            fill
            priority
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 100vw,
                   100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center 35%',
            }}
          />
        </div>
      </div>
      {/* Contenedor de textos con fondo */}
      <div className="relative z-20 bg-black/50 p-6 rounded-lg shadow-lg">
        <div className="text-4xl md:text-7xl font-extrabold">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
            ¡Deliciosos Helados a tu Puerta!
          </h1>
        </div>
        <p className="mt-5 text-xl text-white">
          Descubre nuestros increíbles sabores y disfruta desde la comodidad de tu hogar.
        </p>
      </div>
    </section>
  );
}
