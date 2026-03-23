import type { Metadata } from 'next'
import DashboardShell from './DashboardShell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: 'Dashboard',
    template: '%s | vouchly',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
