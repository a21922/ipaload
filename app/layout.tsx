import './style.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: process.env.SITE_NAME || 'IPA Library', description: 'Discover and download iOS IPA packages.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="zh-CN"><body>{children}</body></html>; }
