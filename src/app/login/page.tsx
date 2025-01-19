'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Wand2, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      console.error('邮箱认证失败:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('该邮箱已被注册');
      } else if (error.code === 'auth/user-not-found') {
        setError('用户不存在');
      } else if (error.code === 'auth/wrong-password') {
        setError('密码错误');
      } else if (error.code === 'auth/invalid-email') {
        setError('邮箱格式不正确');
      } else if (error.code === 'auth/weak-password') {
        setError('密码强度不够，至少6位字符');
      } else {
        setError('认证失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 space-y-8 relative">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange-600 text-sm font-medium mx-auto">
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI 创作助手</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? '创建您的账号' : '欢迎回来'}
            </h2>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              {isSignUp ? '注册账号后即可开始创作' : '登录后继续您的创作之旅'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600 animate-[slideIn_0.2s_ease-out]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  邮箱地址
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入邮箱地址"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pl-11 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入密码"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-4 py-2.5 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center gap-2">
                <ArrowRight className={`w-5 h-5 transition-transform duration-200 ${loading ? 'animate-spin' : 'group-hover:translate-x-1'}`} />
                <span>{isSignUp ? '注册' : '登录'}</span>
              </div>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-600 text-sm hover:underline focus:outline-none"
              >
                {isSignUp ? '已有账号？点击登录' : '没有账号？点击注册'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            {isSignUp ? '注册即表示您同意我们的服务条款和隐私政策' : '登录即表示您同意我们的服务条款和隐私政策'}
          </p>
        </div>
      </div>
    </div>
  );
} 