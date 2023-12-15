import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Workout: AI-powered workout app',
    short_name: 'Workout',
    description: 'Workout: AI-powered workout app',
    start_url: '/',
    display: 'standalone',
    background_color: '#d6dbdc',
    theme_color: '#7b90aa',
    icons: [
      {
        src: 'favicon.ico',
        sizes: '110x110',
        type: 'image/x-icon',
      },
    ],
  }
}
