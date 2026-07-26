'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Play } from 'lucide-react';
import { Platform } from '@/lib/types';

export default function Platforms({ platforms }: { platforms: Platform[] }) {
  if (!platforms.length) return null;

  return (
    <section id="plataformas" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Streaming premium</span>
          <h2 className="section-title mt-4">Las mejores plataformas de entretenimiento</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Suscripciones premium con activación inmediata y garantía.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={16}
          slidesPerView={1.3}
          freeMode
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 4.5 },
          }}
          className="!px-5 sm:!px-8"
        >
          {platforms.map((p) => (
            <SwiperSlide key={p.id}>
              <div className="card flex h-40 flex-col items-center justify-center gap-3 text-center">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.name} className="h-12 w-auto object-contain" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                    <Play size={22} />
                  </span>
                )}
                <div>
                  <div className="font-semibold">{p.name}</div>
                  {p.price && <div className="text-sm text-brand-600 dark:text-brand-300">{p.price}</div>}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
