import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供描述文字' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ prediction: output });
  } catch (error: any) {
    console.error('Generation error:', error);
    
    if (error.response?.status === 422) {
      return NextResponse.json(
        { error: '参数验证失败，请稍后重试' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: '生成图片时出现错误，请稍后重试' },
      { status: 500 }
    );
  }
} 