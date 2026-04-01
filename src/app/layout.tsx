import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Toaster } from 'sonner'
import './globals.css'
import { GoogleTagManager } from '@next/third-parties/google'
import QueryProvider from '@/components/QueryProvider'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vouchly.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'vouchly — Collect & Display Customer Testimonials on your website',
    template: '%s | vouchly',
  },
  description:
    'vouchly lets you collect text & video testimonials from customers, rewrite them with AI, and embed a live testimonial wall on any website — all in one script tag. Free to start.',
  keywords: [
    'testimonial software',
    'customer testimonials',
    'social proof',
    'testimonial wall',
    'collect testimonials',
    'video testimonials',
    'AI testimonial tool',
    'embed testimonials',
    'review collection',
    'customer reviews',
  ],
  authors: [{ name: 'vouchly', url: APP_URL }],
  creator: 'vouchly',
  publisher: 'vouchly',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'vouchly',
    title: 'vouchly — Collect & Display Customer Testimonials',
    description:
      'vouchly lets you collect text & video testimonials, polish them with AI, and embed a live testimonial wall on any site — in one script tag. Free to start.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vouchly — Collect & Display Customer Testimonials',
    description:
      'Collect text & video testimonials from customers, rewrite them with AI, and embed a live testimonial wall on your site — one script tag. Free to start.',
    creator: '@vouchly',
  },
  alternates: {
    canonical: APP_URL,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'vouchly',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/favicon.svg` },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'vouchly',
      publisher: { '@id': `${APP_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'vouchly',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: APP_URL,
      description:
        'Collect text and video testimonials from customers, AI-polish them, and embed a live testimonial wall on any website.',
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Starter', price: '19', priceCurrency: 'USD', billingDuration: 'P1M' },
        { '@type': 'Offer', name: 'Pro', price: '39', priceCurrency: 'USD', billingDuration: 'P1M' },
      ],
    },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleTagManager gtmId="GTM-5LM4ZJ7Z" />
      </head>
      <body className="grain">
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </QueryProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
