import './globals.css';

import type {Metadata} from 'next';
import {DM_Mono, Inter} from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-inter',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

const syncopate = localFont({
  src: './fonts/syncopate-latin-700.woff2',
  weight: '700',
  variable: '--font-syncopate',
  adjustFontFallback: false,
  declarations: [
    {prop: 'ascent-override', value: '95%'},
    {prop: 'descent-override', value: '25%'},
    {prop: 'line-gap-override', value: '0%'},
  ],
});

const revealFontsScript = `
  document.fonts.ready.then(() => {
    document.documentElement.classList.remove('fonts-loading');
  });
`;

export const metadata: Metadata = {
  title: 'Evan Purkhiser',
  description: 'Evan Purkhiser is a software engineer in New York City.',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmMono.variable} ${syncopate.variable} fonts-loading`}
      suppressHydrationWarning
    >
      <head>
        <noscript>
          <style>{'.fonts-loading body { visibility: visible; }'}</style>
        </noscript>
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{__html: revealFontsScript}} />
      </body>
    </html>
  );
}
