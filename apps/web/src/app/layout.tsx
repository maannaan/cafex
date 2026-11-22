import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/commerce/CartDrawer';
import { CheckoutModal } from '../components/commerce/CheckoutModal';

export const metadata: Metadata = {
  title: 'CAFEX | Premium Artisan Roastery & Immersive 3D Experience',
  description:
    'Experience single-origin artisan coffee, hand-poured varietals, fresh French viennoiserie, and table reservations in a sensory digital cafe.',
  keywords: ['artisan coffee', 'roastery', '3D cafe', 'espresso', 'table reservation', 'specialty coffee'],
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-950 text-stone-100 min-h-screen flex flex-col antialiased selection:bg-amber-600 selection:text-white">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <CartDrawer />
        <CheckoutModal />
        <Footer />
      </body>
    </html>
  );
}

