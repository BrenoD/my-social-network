import { AuthProvider } from 'context/AuthContext'
import type { AppProps } from 'next/app'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '600']
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={poppins.variable}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </main>
  )
}
