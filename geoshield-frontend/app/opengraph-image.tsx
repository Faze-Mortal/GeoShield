import { ImageResponse } from 'next/og';

export const alt = 'GeoShield — Landslide Risk Intelligence for Kullu & Mandi';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#090e17',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          border: '12px solid #0f172a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '3px solid white',
                borderRadius: '4px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            GeoShield
          </span>
          <span
            style={{
              fontSize: '16px',
              color: '#38bdf8',
              backgroundColor: '#082f49',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid #0369a1',
              fontFamily: 'monospace',
            }}
          >
            Research Project
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              maxWidth: '960px',
              margin: 0,
            }}
          >
            Two-Layer Landslide Hazard Intelligence
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              maxWidth: '880px',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Susceptibility &amp; Empirical Rainfall Triggers across Kullu and Mandi Districts, Himachal Pradesh
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid #1e293b',
            paddingTop: '24px',
            fontSize: '16px',
            color: '#64748b',
            fontFamily: 'monospace',
          }}
        >
          <span>500m × 500m PostGIS Spatial Grid</span>
          <span>Open Scientific Research &middot; Non-Official Demo</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
