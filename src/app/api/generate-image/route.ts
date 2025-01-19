import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const maxDuration = 300; // 设置最大超时时间为300秒

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供描述文字' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: '服务器配置错误：缺少API Token' },
        { status: 500 }
      );
    }

    console.log('Starting image generation with prompt:', prompt);
    
    const output = await replicate.run(
      "ideogram-ai/ideogram-v2",
      {
        input: {
          prompt: prompt,
          resolution: "None",
          style_type: "None",
          aspect_ratio: "16:9",
          magic_prompt_option: "Auto"
        }
      }
    );

    console.log('Generation completed, output:', output);

    if (!output) {
      throw new Error('生成结果为空');
    }

    return NextResponse.json({ prediction: output });
  } catch (error: any) {
    console.error('Generation error:', error);
    
    // 处理不同类型的错误
    if (error.response?.status === 504) {
      return NextResponse.json(
        { error: '生成超时，请重试' },
        { status: 504 }
      );
    }

    if (error.response?.status === 422) {
      return NextResponse.json(
        { error: '参数验证失败，请稍后重试' },
        { status: 422 }
      );
    }

    if (error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: '连接超时，请重试' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: '生成图片时出现错误，请稍后重试' },
      { status: 500 }
    );
  }
} 