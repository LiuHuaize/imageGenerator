'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase';
import { getUserDesigns, deleteDesign } from '@/lib/firebase/designService';
import { Design } from '@/types/design';
import { Download, Trash2, Loader2, Wand2, ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('MyDesignsPage mounted');
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.uid}` : 'No user');
      
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        console.log('开始获取用户作品:', user.uid);
        const userDesigns = await getUserDesigns(user.uid);
        console.log('获取到的作品数量:', userDesigns.length);
        console.log('作品详情:', userDesigns);
        setDesigns(userDesigns);
      } catch (error) {
        console.error('加载作品失败:', error);
        setError(error instanceof Error ? error.message : '加载失败');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('MyDesignsPage unmounting');
      unsubscribe();
    };
  }, [router]);

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleDelete = async (designId: string) => {
    if (!window.confirm('确定要删除这个作品吗？')) {
      return;
    }

    try {
      await deleteDesign(designId);
      setDesigns(designs.filter(design => design.id !== designId));
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-100 rounded-full animate-[spin_2s_linear_infinite]"></div>
            <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-[spin_1.5s_linear_infinite] absolute inset-0 border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium animate-[pulse_2s_ease-in-out_infinite]">加载作品中...</p>
        </div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center relative">
        {/* 装饰性背景元素 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange-600 text-sm font-medium animate-[slideDown_0.5s_ease-out]">
            <Wand2 className="w-3.5 h-3.5" />
            <span>开始创作之旅</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">还没有任何作品</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              开始创作您的第一个 AI 艺术作品吧！
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            <ImageIcon className="w-4 h-4" />
            立即创作
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-orange-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-50/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* 页面标题 */}
      <div className="relative">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-orange-600 transition-colors duration-200 group mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          返回首页
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange-600 text-sm font-medium">
            <Wand2 className="w-3.5 h-3.5" />
            <span>我的作品集</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          已创作的作品 ({designs.length})
        </h2>
      </div>
      
      {/* 作品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design, index) => (
          <div
            key={design.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="aspect-[16/9] relative overflow-hidden">
              <img
                src={design.imageUrl}
                alt={design.prompt}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-sm line-clamp-2 mb-3 opacity-90">
                    {design.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(design.imageUrl)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors duration-200"
                        title="下载作品"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(design.id)}
                        className="p-2 bg-white/10 hover:bg-red-500/80 rounded-lg backdrop-blur-sm transition-colors duration-200"
                        title="删除作品"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 