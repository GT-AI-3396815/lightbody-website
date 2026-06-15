import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { prompt, category } = await request.json();
    if (!prompt || !category) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // 使用 DeepSeek API 生成内容
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'DeepSeek API Key 未配置' }, { status: 500 });
    }

    const systemPrompt = `你是光体文明的智能创作助手。你基于光体文明的世界观体系进行内容创作。
光体文明核心理念：以光为介质、以意识为结构的高维存在形式。人类是潜能光体，需要通过意识觉醒实现升维。
请在以下类别中创作：${category}。保持简洁有深度的风格，200-500字。`;

    const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!dsRes.ok) {
      const errText = await dsRes.text();
      throw new Error(`DeepSeek API 返回错误(${dsRes.status}): ${errText.slice(0, 200)}`);
    }

    const dsData = await dsRes.json();
    const result = dsData.choices?.[0]?.message?.content || '生成结果为空';

    // 保存到数据库
    const serviceSupabase = createServiceRoleSupabase();
    const { error: insertError } = await serviceSupabase
      .from('generated_content')
      .insert({
        user_id: 'anonymous',
        prompt: prompt.trim(),
        category,
        result,
      });

    if (insertError) {
      console.error('Save error:', insertError);
      return NextResponse.json({ success: true, result, warning: '内容已生成但保存到数据库失败' });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Generate error:', error);
    const message = error instanceof Error ? error.message : '生成失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
