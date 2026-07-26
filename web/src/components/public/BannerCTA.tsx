import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Banner } from '@/lib/types';

export default function BannerCTA({ banner }: { banner?: Banner }) {
  if (!banner) return null;

  return (
    <section className="py-10">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-fuchsia-600 px-8 py-12 text-center text-white shadow-glow sm:px-14 sm:py-16">
            <div className="bg-grid absolute inset-0 opacity-20" />
            <div className="relative">
              <h2 className="text-2xl font-bold sm:text-3xl">{banner.title}</h2>
              {banner.subtitle && (
                <p className="mx-auto mt-3 max-w-2xl text-white/90">{banner.subtitle}</p>
              )}
              <a
                href={banner.link || '#contacto'}
                className="btn mt-7 bg-white text-brand-700 hover:bg-white/90"
              >
                Contactar ahora <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
