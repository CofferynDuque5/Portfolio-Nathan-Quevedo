/**
 * Textos del contenido base que cambiaron después de publicarse (ahora todo
 * está en primera persona: "te asesoro" en vez de "te asesoramos").
 *
 * Las instalaciones nuevas ya se crean con los textos nuevos. En las que ya
 * existen, se actualiza una sola vez cada texto que siga siendo el original
 * (lo que editaste en el panel no se toca), y también su traducción al inglés
 * si sigue siendo la automática.
 */

/** [modelo, recurso, campo, [es antes, es ahora], [en antes, en ahora]?] */
const FIRST_PERSON = [
  [
    'heroSlide', 'heroSlides', 'subtitle',
    ['Configuramos tus licencias y aplicaciones de forma remota, rápida y segura.', 'Configuro tus licencias y aplicaciones de forma remota, rápida y segura.'],
    ['We set up your licenses and apps remotely, quickly and securely.', 'I set up your licenses and apps remotely, quickly and securely.'],
  ],
  [
    'service', 'services', 'shortDesc',
    ['Configuramos todo por ti, de forma remota.', 'Configuro todo por ti, de forma remota.'],
    ['We set everything up for you, remotely.', 'I set everything up for you, remotely.'],
  ],
  [
    'faq', 'faqs', 'answer',
    ['Sí, todas nuestras licencias son 100% originales y verificadas.', 'Sí, todas las licencias que ofrezco son 100% originales y verificadas.'],
    ['Yes, all our licenses are 100% genuine and verified.', 'Yes, every license I offer is 100% genuine and verified.'],
  ],
  ['faq', 'faqs', 'question', ['¿Ofrecen soporte después de la compra?', '¿Ofreces soporte después de la compra?']],
  [
    'faq', 'faqs', 'answer',
    ['Por supuesto. Brindamos soporte técnico continuo tras cada servicio.', 'Por supuesto. Brindo soporte técnico continuo tras cada servicio.'],
    ['Of course. We provide ongoing technical support after every service.', 'Of course. I provide ongoing technical support after every service.'],
  ],
  ['faq', 'faqs', 'question', ['¿Qué métodos de pago aceptan?', '¿Qué métodos de pago aceptas?']],
  [
    'faq', 'faqs', 'answer',
    ['Aceptamos múltiples métodos de pago. Escríbenos y te asesoramos.', 'Acepto múltiples métodos de pago. Escríbeme y te asesoro.'],
    ['We accept multiple payment methods. Message us and we will advise you.', 'I accept multiple payment methods. Message me and I will advise you.'],
  ],
  [
    'banner', 'banners', 'subtitle',
    ['Escríbenos y actívala en minutos con instalación remota incluida.', 'Escríbeme y actívala en minutos con instalación remota incluida.'],
    ['Message us and get it activated in minutes, remote installation included.', 'Message me and get it activated in minutes, remote installation included.'],
  ],
];

/** Correo de contacto que dio Nathan (2026-09-29). */
const CONTACT_EMAIL = { label: 'Correo', value: 'quevedomoralesnathan05@gmail.com', icon: 'Mail', type: 'email' };

/**
 * Añade el correo a la información de contacto, detrás de WhatsApp, si no hay
 * ya un correo. Su etiqueta en inglés es "Email".
 */
async function addContactEmail(prisma, log = console.log) {
  if (await prisma.contactInfo.findFirst({ where: { type: 'email' } })) return;
  const whatsapp = await prisma.contactInfo.findFirst({ where: { type: 'whatsapp' } });
  const order = (whatsapp?.order ?? -1) + 1;
  await prisma.contactInfo.updateMany({ where: { order: { gte: order } }, data: { order: { increment: 1 } } });
  const created = await prisma.contactInfo.create({ data: { ...CONTACT_EMAIL, order, active: true } });
  await prisma.contentTranslation.create({
    data: { locale: 'en', resource: 'contactInfo', recordId: created.id, field: 'label', value: 'Email' },
  });
  log(`   ✓ Correo de contacto añadido (${CONTACT_EMAIL.value})`);
}

async function applyCopyUpdates(prisma, log = console.log) {
  let changed = 0;
  for (const [model, resource, field, [esOld, esNew], en] of FIRST_PERSON) {
    const records = await prisma[model].findMany({ where: { [field]: esOld }, select: { id: true } });
    if (!records.length) continue;
    const ids = records.map((r) => r.id);
    await prisma[model].updateMany({ where: { id: { in: ids } }, data: { [field]: esNew } });
    changed += ids.length;
    if (en) {
      await prisma.contentTranslation.updateMany({
        where: { locale: 'en', resource, field, recordId: { in: ids }, value: en[0] },
        data: { value: en[1] },
      });
    }
  }
  if (changed) log(`   ✓ ${changed} textos del contenido base pasados a primera persona`);
}

module.exports = { applyCopyUpdates, addContactEmail, CONTACT_EMAIL, FIRST_PERSON };
