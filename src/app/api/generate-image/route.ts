import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 设置响应头，避免CORS问题
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const maxDuration = 300; // 设置最大超时时间为300秒

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse(
        JSON.stringify({ error: '请提供描述文字' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return new NextResponse(
        JSON.stringify({ error: '服务器配置错误：缺少API Token' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log('Starting image generation with prompt:', prompt);
    
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: prompt,
          image_dimensions: "512x512",
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "DPMSolverMultistep",
        },
      }
    );

    console.log('Generation completed, output:', output);

    if (!output) {
      return new NextResponse(
        JSON.stringify({ error: '生成结果为空' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ prediction: output }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.error('Generation error:', error);
    
    let statusCode = 500;
    let errorMessage = '生成图片时出现错误，请稍后重试';

    if (error.response?.status === 504) {
      statusCode = 504;
      errorMessage = '生成超时，请重试';
    } else if (error.response?.status === 422) {
      statusCode = 422;
      errorMessage = '参数验证失败，请稍后重试';
    } else if (error.code === 'ETIMEDOUT') {
      statusCode = 408;
      errorMessage = '连接超时，请重试';
    }

    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
} 