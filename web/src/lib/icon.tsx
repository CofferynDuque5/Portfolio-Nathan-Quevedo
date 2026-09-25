'use client';

import { ComponentType, useEffect, useState } from 'react';
import {
  Award, BadgeCheck, BookOpen, Briefcase, Camera, CircleCheck, Clock, Cloud, Code, Cpu, CreditCard,
  Database, Download, Facebook, FileText, Film, Gamepad2, Gift, Github, Globe, GraduationCap, HardDrive,
  Headphones, Headset, Heart, Instagram, KeyRound, Laptop, Linkedin, Lock, LucideProps, Mail, MapPin,
  MessageCircle, MessageSquare, Monitor, MonitorSmartphone, Music, Music2, Palette, Phone, Play, Printer,
  Rocket, Send, Server, Settings, Shield, ShieldCheck, ShoppingCart, Smartphone, Sparkles, Star, Tv, Twitter,
  Users, Video, Wifi, Wrench, Youtube, Zap,
} from 'lucide-react';

type IconCmp = ComponentType<LucideProps>;

/**
 * Iconos habituales del sitio, incluidos en el paquete: se ven al instante.
 * Importar toda la librería añadía unos 1500 iconos a cada página.
 */
const COMMON: Record<string, IconCmp> = {
  Award, BadgeCheck, BookOpen, Briefcase, Camera, CircleCheck, Clock, Cloud, Code, Cpu, CreditCard,
  Database, Download, Facebook, FileText, Film, Gamepad2, Gift, Github, Globe, GraduationCap, HardDrive,
  Headphones, Headset, Heart, Instagram, KeyRound, Laptop, Linkedin, Lock, Mail, MapPin,
  MessageCircle, MessageSquare, Monitor, MonitorSmartphone, Music, Music2, Palette, Phone, Play, Printer,
  Rocket, Send, Server, Settings, Shield, ShieldCheck, ShoppingCart, Smartphone, Sparkles, Star, Tv, Twitter,
  Users, Video, Wifi, Wrench, Youtube, Zap,
};

/** Otros iconos elegidos en el panel: se cargan aparte, una sola vez. */
const loaded = new Map<string, IconCmp>();
let library: Promise<Record<string, unknown>> | null = null;

function loadIcon(name: string): Promise<IconCmp> {
  library ??= import('lucide-react') as Promise<Record<string, unknown>>;
  return library.then((all) => {
    const cmp = (all[name] as IconCmp | undefined) ?? Sparkles;
    loaded.set(name, cmp);
    return cmp;
  });
}

/**
 * Renderiza un icono de lucide-react a partir de su nombre (string) guardado
 * en la base de datos. Si el nombre no existe, usa un icono por defecto.
 */
export function Icon({ name, ...props }: { name?: string | null } & Omit<LucideProps, 'name'>) {
  const key = name || 'Sparkles';
  const known = COMMON[key] ?? loaded.get(key);
  const [lazy, setLazy] = useState<IconCmp | null>(null);

  useEffect(() => {
    if (known) return;
    let alive = true;
    loadIcon(key).then((cmp) => alive && setLazy(() => cmp));
    return () => {
      alive = false;
    };
  }, [key, known]);

  const Cmp = known ?? lazy;
  if (Cmp) return <Cmp {...props} />;
  // Mientras carga, un hueco del mismo tamaño para que nada se mueva.
  const size = props.size ?? 24;
  return <span aria-hidden className={props.className} style={{ display: 'inline-block', width: size, height: size }} />;
}
