import { getTranslations } from 'next-intl/server'
import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { Flame } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('auth')

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4">
            <Flame className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Aplauso para el Asador</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">{t('register')}</h2>
          <RegisterForm locale={locale} />
        </div>

        <p className="text-center text-sm text-stone-500 mt-4">
          {t('haveAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-brand-600 font-medium hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
