'use client';

import Link from 'next/link';
import { FolderOpen, Wand2 } from 'lucide-react';
import Profile from './Profile';

export default function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Wand2 className="w-5 h-5 text-orange-500" />
              AI 创作助手
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/my-designs" 
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors duration-200"
              >
                <FolderOpen className="w-4 h-4" />
                我的作品
              </Link>
            </nav>
          </div>
          <Profile />
        </div>
      </div>
    </header>
  );
} 