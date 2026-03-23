import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    testimonials: 5,
    spaces: 1,
    ai: false,
    video: false,
    customDomain: false,
    removeBranding: false,
  },
  starter: {
    name: 'Starter',
    price: 19,
    testimonials: -1, // unlimited
    spaces: 3,
    ai: true,
    video: false,
    customDomain: false,
    removeBranding: true,
  },
  pro: {
    name: 'Pro',
    price: 39,
    testimonials: -1,
    spaces: -1,
    ai: true,
    video: true,
    customDomain: true,
    removeBranding: true,
  },
}
