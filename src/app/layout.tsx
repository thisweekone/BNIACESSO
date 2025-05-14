import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BNI Acesso',
  description: 'Plataforma de networking para membros BNI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}