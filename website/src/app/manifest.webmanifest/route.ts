import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';

  const manifest = {
    id: 'pranayama-times',
    name: 'Pranayama Times',
    short_name: 'Pranayama Times',
    description: 'Classical pranayama breathing timer and guided yoga nidra by Still Mountain.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#EDE8DC',
    theme_color: '#263F35',
    categories: ['health', 'lifestyle', 'wellness', 'education'],
    icons: [
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png?v=2',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': isDev ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600, must-revalidate',
    },
  });
}
