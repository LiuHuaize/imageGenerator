'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { User } from 'firebase/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-colors duration-200"
      >
        <UserIcon className="w-5 h-5" />
        登录
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 hover:bg-orange-50 rounded-full transition-all duration-200"
      >
        {user?.photoURL && (
          <div className="relative w-10 h-10">
            <Image
              src={user.photoURL}
              alt="Profile"
              fill
              className="rounded-full"
              sizes="40px"
            />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-2 z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">
              {user.displayName || '用户'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
} 