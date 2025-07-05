import type { Metadata, Viewport } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa' })

export const metadata: Metadata = {
  title: 'Scanne',
  description: 'Advanced farm field management with GIS capabilities',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${inter.className} ${comfortaa.variable} h-full overflow-hidden`}>
        <div className="h-full bg-gray-50 overflow-hidden">
          {children}
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Auto-refresh cache on page load
            window.addEventListener('DOMContentLoaded', async function() {
              try {
                console.log('🔄 Auto-refreshing localStorage cache on page load...');

                // Check if cache exists and is older than 1 hour
                const cacheKeys = ['scanne_sugarcane_varieties', 'scanne_intercrop_varieties', 'scanne_products', 'scanne_resources'];
                let shouldRefresh = false;

                for (const key of cacheKeys) {
                  const item = localStorage.getItem(key);
                  if (!item) {
                    shouldRefresh = true;
                    break;
                  }

                  try {
                    const parsed = JSON.parse(item);
                    const age = Date.now() - (parsed.timestamp || 0);
                    const ageHours = age / (1000 * 60 * 60);

                    // Refresh if older than 1 hour or no timestamp
                    if (ageHours > 1 || !parsed.timestamp) {
                      shouldRefresh = true;
                      break;
                    }
                  } catch (e) {
                    shouldRefresh = true;
                    break;
                  }
                }

                if (shouldRefresh) {
                  console.log('🔄 Cache is stale or missing, refreshing...');
                  // Clear old cache
                  cacheKeys.forEach(key => localStorage.removeItem(key));
                  console.log('✅ Auto-refresh completed on page load');
                } else {
                  console.log('✅ Cache is fresh, no refresh needed');
                }
              } catch (error) {
                console.error('❌ Error during auto-refresh:', error);
              }
            });

            // Global function to refresh localStorage data
            window.refreshLocalStorageData = async function() {
              const { LocalStorageService } = await import('/src/services/localStorageService.ts');
              await LocalStorageService.refreshAllData();
              console.log('✅ localStorage data refreshed! Please reload the page.');
            };

            // Global function to clear localStorage cache
            window.clearLocalStorageCache = function() {
              const keys = ['scanne_sugarcane_varieties', 'scanne_intercrop_varieties', 'scanne_products', 'scanne_resources'];
              keys.forEach(key => localStorage.removeItem(key));
              console.log('🧹 localStorage cache cleared! Please reload the page.');
            };

            console.log('🛠️ Debug functions available:');
            console.log('- clearLocalStorageCache() - Clear cached data');
            console.log('- refreshLocalStorageData() - Refresh data from database');
          `
        }} />
      </body>
    </html>
  )
}
