import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <RegisterForm />
        <div className="text-center mt-4 space-y-2">
          <div>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              已有账号？立即登录
            </Link>
          </div>
          <div>
            <Link href="/" className="text-gray-600 hover:text-gray-800 font-medium hover:underline text-sm">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}