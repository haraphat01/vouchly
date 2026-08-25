export type Locale = 'en' | 'fr' | 'es' | 'de'

export interface Copy {
  hookLine1: string
  hookLine2: string
  brandTagline: string
  feature1Kicker: string
  feature1Headline: string
  feature1RatingLabel: string
  feature1RecordingLabel: string
  feature2Kicker: string
  feature2Headline: string
  feature2Before: string
  feature2After: string
  feature3Kicker: string
  feature3Headline: string
  feature3Snippet: string
  statValue1: string
  statLabel1: string
  statValue2: string
  statLabel2: string
  ctaHeadline: string
  ctaSub: string
  ctaButton: string
  ctaUrl: string
}

export const COPY: Record<Locale, Copy> = {
  en: {
    hookLine1: 'Every doubt costs you a sale.',
    hookLine2: 'Give them proof instead.',
    brandTagline: 'vouchly turns happy customers into your best salespeople — automatically.',
    feature1Kicker: 'COLLECT',
    feature1Headline: 'Grab text & video testimonials in one click',
    feature1RatingLabel: 'Your rating',
    feature1RecordingLabel: 'Recording video…',
    feature2Kicker: 'BUILT-IN AI',
    feature2Headline: 'AI turns a quick note into a 5-star story',
    feature2Before: '"it was good"',
    feature2After: '"A responsive team that doubled our sales in a month."',
    feature3Kicker: 'DISPLAY',
    feature3Headline: 'One script tag. Live in seconds.',
    feature3Snippet: '<script src="vouchly.tech/embed.js">',
    statValue1: '4.9★',
    statLabel1: 'average rating',
    statValue2: '80+',
    statLabel2: 'testimonials collected',
    ctaHeadline: "Don't lose another sale.",
    ctaSub: 'Free forever · Live in under 5 minutes',
    ctaButton: 'Start collecting free →',
    ctaUrl: 'vouchly.tech',
  },
  fr: {
    hookLine1: 'Chaque doute vous coûte une vente.',
    hookLine2: 'Donnez-leur des preuves.',
    brandTagline: 'vouchly transforme vos clients satisfaits en vendeurs — automatiquement.',
    feature1Kicker: 'COLLECTER',
    feature1Headline: 'Captez des témoignages texte et vidéo en un clic',
    feature1RatingLabel: 'Votre note',
    feature1RecordingLabel: 'Enregistrement vidéo…',
    feature2Kicker: 'IA INTÉGRÉE',
    feature2Headline: "L'IA transforme un mot rapide en histoire 5 étoiles",
    feature2Before: '« c’était bien »',
    feature2After: '« Une équipe réactive qui a doublé nos ventes en un mois. »',
    feature3Kicker: 'AFFICHER',
    feature3Headline: 'Une balise. En ligne en quelques secondes.',
    feature3Snippet: '<script src="vouchly.tech/embed.js">',
    statValue1: '4,9★',
    statLabel1: 'note moyenne',
    statValue2: '80+',
    statLabel2: 'témoignages collectés',
    ctaHeadline: 'Ne perdez plus une seule vente.',
    ctaSub: 'Gratuit à vie · En ligne en moins de 5 minutes',
    ctaButton: 'Démarrer gratuitement →',
    ctaUrl: 'vouchly.tech',
  },
  es: {
    hookLine1: 'Cada duda te cuesta una venta.',
    hookLine2: 'Dales pruebas.',
    brandTagline: 'vouchly convierte a tus clientes felices en vendedores — automáticamente.',
    feature1Kicker: 'RECOPILA',
    feature1Headline: 'Consigue testimonios en texto y vídeo con un clic',
    feature1RatingLabel: 'Tu valoración',
    feature1RecordingLabel: 'Grabando vídeo…',
    feature2Kicker: 'IA INTEGRADA',
    feature2Headline: 'La IA convierte una nota rápida en una historia de 5 estrellas',
    feature2Before: '«estuvo bien»',
    feature2After: '«Un equipo increíble que duplicó nuestras ventas en un mes.»',
    feature3Kicker: 'MUESTRA',
    feature3Headline: 'Una etiqueta. En vivo en segundos.',
    feature3Snippet: '<script src="vouchly.tech/embed.js">',
    statValue1: '4,9★',
    statLabel1: 'valoración media',
    statValue2: '80+',
    statLabel2: 'testimonios recopilados',
    ctaHeadline: 'No pierdas ni una venta más.',
    ctaSub: 'Gratis para siempre · En vivo en menos de 5 minutos',
    ctaButton: 'Empezar gratis →',
    ctaUrl: 'vouchly.tech',
  },
  de: {
    hookLine1: 'Jeder Zweifel kostet Sie einen Verkauf.',
    hookLine2: 'Geben Sie ihnen Beweise.',
    brandTagline: 'vouchly macht zufriedene Kunden automatisch zu Verkäufern.',
    feature1Kicker: 'SAMMELN',
    feature1Headline: 'Sammeln Sie Text- und Video-Referenzen mit einem Klick',
    feature1RatingLabel: 'Ihre Bewertung',
    feature1RecordingLabel: 'Video wird aufgenommen…',
    feature2Kicker: 'MIT KI',
    feature2Headline: 'KI macht aus einer Notiz eine 5-Sterne-Geschichte',
    feature2Before: '„war gut“',
    feature2After: '„Ein großartiges Team, das unseren Umsatz verdoppelt hat.“',
    feature3Kicker: 'ANZEIGEN',
    feature3Headline: 'Ein Script-Tag. In Sekunden live.',
    feature3Snippet: '<script src="vouchly.tech/embed.js">',
    statValue1: '4,9★',
    statLabel1: 'Durchschnittsbewertung',
    statValue2: '80+',
    statLabel2: 'gesammelte Referenzen',
    ctaHeadline: 'Verlieren Sie keinen Verkauf mehr.',
    ctaSub: 'Für immer kostenlos · Live in unter 5 Minuten',
    ctaButton: 'Kostenlos starten →',
    ctaUrl: 'vouchly.tech',
  },
}
