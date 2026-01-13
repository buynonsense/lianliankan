import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <LoginForm />
        <div className="text-center mt-4 space-y-2">
          <div>
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              还没有账号？立即注册
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