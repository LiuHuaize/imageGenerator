'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Download, RefreshCw, Image as ImageIcon, AlertCircle, Pencil, Wand2 } from 'lucide-react';
import { auth } from '@/lib/firebase/firebase';
import { saveDesign } from '@/lib/firebase/designService';
import Image from 'next/image';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generateImage = async () => {
    if (!auth.currentUser) {
      setError('请先登录');
      router.push('/login');
      return;
    }

    if (!prompt.trim()) {
      setError('请输入描述文字');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 1. 生成图片
      console.log('Generating image with prompt:', prompt);
      
      // 添加重试机制
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;
      let imageUrl = null;

      while (retryCount < maxRetries && !success) {
        try {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 504) {
              console.log(`Attempt ${retryCount + 1} timed out, retrying...`);
              retryCount++;
              continue;
            }
            throw new Error(data.error || '生成图片失败');
          }

          imageUrl = Array.isArray(data.prediction) ? data.prediction[0] : data.prediction;
          if (!imageUrl) {
            throw new Error('生成的图片URL无效');
          }
          
          success = true;
          console.log('Image generated successfully:', imageUrl);
          setImage(imageUrl);
        } catch (err) {
          if (retryCount === maxRetries - 1) {
            throw err;
          }
          retryCount++;
          console.log(`Attempt ${retryCount} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
        }
      }

      // 2. 保存到Firebase
      if (success && imageUrl) {
        try {
          console.log('Saving to Firebase...');
          await saveDesign(auth.currentUser.uid, prompt, imageUrl);
          console.log('Saved to Firebase successfully');
        } catch (saveError) {
          console.error('Error saving to Firebase:', saveError);
          setError('图片已生成，但保存失败，请稍后重试');
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      if (err.message.includes('timeout') || err.message.includes('超时')) {
        setError('生成超时，请重试或简化您的描述');
      } else {
        setError(err.message || '生成失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ideogram-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="w-full relative">
      {/* 装饰性背景元素 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      
      <div className="relative space-y-8">
        {/* 标题部分 */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full text-orange-600 text-sm font-medium animate-[slideDown_0.5s_ease-out]">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI 创作助手</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 animate-[slideDown_0.6s_ease-out]">
            让创意转化为艺术
          </h2>
        </div>

        {/* Helper text with floating animation */}
        <div className="text-sm text-gray-600 flex items-center gap-2 animate-[float_3s_ease-in-out_infinite]">
          <Pencil className="w-4 h-4 text-orange-500" />
          <span>输入简单的文字描述，让 AI 为您创作独特的艺术作品</span>
        </div>

        {/* Input section with enhanced animations */}
        <div className="space-y-4">
          <div className="flex gap-3 animate-[slideUp_0.5s_ease-out]">
            <div className="relative flex-1 group">
              <input
                id="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述您想要创作的画面，例如：一只可爱的熊猫在竹林中玩耍..."
                className="w-full px-4 py-3 bg-white rounded-xl ring-1 ring-gray-200 group-hover:ring-orange-200 focus:ring-orange-500 focus:ring-2 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-900 text-[0.95rem] leading-relaxed pr-10 shadow-sm"
              />
              <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
            </div>
            <button
              onClick={generateImage}
              disabled={loading}
              className="relative px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 text-[0.95rem] font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创作中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-[twinkle_1.5s_ease-in-out_infinite]" />
                  开始创作
                </>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl animate-[slideIn_0.2s_ease-out] hover:bg-red-100/80 transition-colors duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 animate-[bounce_1s_ease-in-out]" />
              <p className="text-sm text-red-600 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Image display section with enhanced animations */}
        {image && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="relative group/image">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-200 transition-all duration-500 group-hover/image:shadow-xl group-hover/image:shadow-orange-100/30 group-hover/image:ring-orange-200">
                <Image
                  src={image}
                  alt="Generated artwork"
                  fill
                  className="object-cover w-full h-full transform transition-all duration-700 ease-out will-change-transform group-hover/image:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {/* Enhanced overlay controls */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover/image:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="p-3 bg-white/90 rounded-xl hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  title="下载作品"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={generateImage}
                  className="p-3 bg-white/90 rounded-xl hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  title="重新创作"
                >
                  <RefreshCw className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-orange-100 rounded-full animate-[spin_2s_linear_infinite]"></div>
              <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-[spin_1.5s_linear_infinite] absolute inset-0 border-t-transparent"></div>
            </div>
            <p className="text-gray-600 font-medium animate-[pulse_2s_ease-in-out_infinite]">AI 正在创作中...</p>
          </div>
        </div>
      )}
    </div>
  );
} 