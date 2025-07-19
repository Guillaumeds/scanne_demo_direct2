import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scanne',
  description: 'Advanced farm field management with GIS capabilities',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 0.5,
  maximumScale: 3.0,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <QueryProvider>
          <div className="h-full bg-gray-50">
            {children}
          </div>
        </QueryProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Demo mode debug functions
            window.addEventListener('DOMContentLoaded', function() {
              console.log('🎬 Scanne Demo Mode Initialized');
              console.log('🛠️ Demo functions available:');
              console.log('- window.resetDemo() - Reset demo to initial state');
              console.log('- window.exportDemo() - Export current demo data');
              console.log('- window.clearDemoCache() - Clear TanStack Query cache');
            });

            // Global demo functions
            window.resetDemo = async function() {
              try {
                const { DemoUtils } = await import('/src/utils/demoUtils.js');
                await DemoUtils.resetToDefault();
                console.log('✅ Demo reset completed! Reloading page...');
                window.location.reload();
              } catch (error) {
                console.error('❌ Error resetting demo:', error);
              }
            };

            window.exportDemo = async function() {
              try {
                const { DemoUtils } = await import('/src/utils/demoUtils.js');
                const data = await DemoUtils.exportCurrentState();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scanne-demo-export.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('✅ Demo data exported!');
              } catch (error) {
                console.error('❌ Error exporting demo:', error);
              }
            };

            window.clearDemoCache = function() {
              try {
                localStorage.removeItem('SCANNE_DEMO_QUERY_CACHE');
                console.log('🧹 Demo cache cleared! Reloading page...');
                window.location.reload();
              } catch (error) {
                console.error('❌ Error clearing demo cache:', error);
              }
            };
          `
        }} />
      </body>
    </html>
  )
}
