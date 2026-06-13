import { getTranslations } from 'next-intl/server'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

type Props = { params: Promise<{ locale: string }> }

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-rose-700 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-rose-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 drop-shadow-lg select-none">🔥</div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight drop-shadow">
            Aplauso para el Asador
          </h1>
          <p className="text-orange-200/80 text-sm mt-2 font-medium">
            Tu asado, perfectamente coordinado
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/25 p-7">
          <h2 className="font-display text-xl font-bold text-stone-900 mb-6">{t('login')}</h2>
          <LoginForm locale={locale} />
        </div>

        <p className="text-center text-sm text-orange-200/80 mt-5">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/register`} className="text-white font-semibold hover:underline underline-offset-2">
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
