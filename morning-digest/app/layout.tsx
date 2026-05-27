import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Morning Digest',
  description: 'エンジニア向け朝のニュースダイジェスト',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
