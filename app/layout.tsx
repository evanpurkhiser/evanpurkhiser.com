import './globals.css';

import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Evan Purkhiser',
  description: 'Evan Purkhiser is a software engineer in New York City.',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono&family=Inter:wght@300;600&family=Syncopate:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
