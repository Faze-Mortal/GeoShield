import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operational Risk Map — GeoShield',
  description:
    'Interactive landslide susceptibility and rainfall trigger risk map for Kullu and Mandi districts, Himachal Pradesh.',
  alternates: {
    canonical: '/dashboard',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
