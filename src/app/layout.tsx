import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aarmambh Labs CRM — Enterprise Lead & Finance Management',
  description:
    'Industry-grade Lead Management System with AI parsing, Telegram @tag notifications, Google Calendar sync, and Bhola AI assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
