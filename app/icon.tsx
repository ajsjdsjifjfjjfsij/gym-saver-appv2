import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 240,
          background: '#0E1114', // Carbon Pro dark background
          color: '#21E17C',      // Neon green primary color
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          borderRadius: '20%',
        }}
      >
        GS
      </div>
    ),
    { ...size }
  )
}
