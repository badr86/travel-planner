import { Inter } from 'next/font/google';
import { TravelProvider } from '@/context/TravelContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Travel Planner',
  description: 'Plan your next adventure with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TravelProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </TravelProvider>
      </body>
    </html>
  );
}
