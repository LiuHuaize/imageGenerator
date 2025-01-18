import ImageGenerator from './components/ImageGenerator';
import { Sparkles, Wand2, Zap, Palette, Gauge } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-orange-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-blue-50/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-left space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 ring-1 ring-orange-500/10 text-orange-600 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group animate-slide-down">
              <Sparkles className="w-3.5 h-3.5 group-hover:animate-[twinkle_1.5s_ease-in-out_infinite]" />
              AI Image Creator
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight sm:leading-[1.2] animate-slide-down">
                Turn Your Ideas Into
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 animate-fade-in">Beautiful Artwork</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed animate-slide-up">
                只需简单描述您的想法，AI 就能为您创造独特的艺术作品。让创作变得轻松自然。
              </p>
            </div>

            {/* Stats with animations */}
            <div className="grid grid-cols-3 gap-6 py-8 border-t border-gray-100">
              {[
                { label: '生成速度', value: '3-5s', icon: Gauge },
                { label: '支持风格', value: '10+', icon: Palette },
                { label: '满意度', value: '98%', icon: Zap },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="group p-4 bg-white/60 backdrop-blur-sm rounded-xl ring-1 ring-gray-100 hover:ring-orange-100 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/20 hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <stat.icon className="w-5 h-5 text-orange-500 group-hover:animate-bounce" />
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{stat.value}</div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Generator */}
          <div className="relative animate-slide-up">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/50 to-blue-50/50 rounded-3xl -rotate-1 scale-[1.02] group-hover:scale-[1.03] transition-transform duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 sm:p-8">
              <ImageGenerator />
            </div>
          </div>
        </div>

        {/* Features section with enhanced animations */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '高品质成像',
              description: '采用先进的 AI 模型，确保生成高质量的图像效果',
              icon: Sparkles,
              gradient: 'from-orange-500 to-orange-600'
            },
            {
              title: '简约交互',
              description: '极简的操作流程，让创作变得轻松自然',
              icon: Wand2,
              gradient: 'from-blue-500 to-blue-600'
            },
            {
              title: '即时生成',
              description: '优化的处理机制，带来流畅的创作体验',
              icon: Zap,
              gradient: 'from-purple-500 to-purple-600'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group px-6 py-8 bg-white/60 backdrop-blur-sm rounded-2xl ring-1 ring-gray-100 hover:ring-orange-100 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100/20 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative w-12 h-12 mb-6">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative flex items-center justify-center w-full h-full">
                  <feature.icon className="w-6 h-6 text-gray-900 group-hover:animate-bounce" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors duration-300">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
