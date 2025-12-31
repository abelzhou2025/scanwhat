// Vercel Serverless Function for OCR
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // 设置 CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求（CORS preflight）
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { base64Image, mimeType } = request.body;

    if (!base64Image || !mimeType) {
      return response.status(400).json({ 
        error: 'Missing base64Image or mimeType' 
      });
    }

    // 从环境变量获取 API 密钥
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('API key not configured');
      return response.status(500).json({ 
        error: 'API key not configured' 
      });
    }

    // 调用 OCR API (Gemini)
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
              {
                text: 'Convert the document in the image to markdown, preserving the original text and structure as accurately as possible.',
              },
            ],
          }],
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', errorText);
      return response.status(apiResponse.status).json({ 
        error: `API call failed: ${errorText}` 
      });
    }

    const data = await apiResponse.json();
    
    // 提取文本
    let extractedText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      extractedText = data.candidates[0].content.parts
        .map((part: any) => part.text || '')
        .join('');
    }

    // 移除不需要的前缀
    const unwantedPrefixRegex = /^(Based on the image provided, here is the text converted (to|into) Markdown( format)?:?|以下是图片中内容的文字转写：)\s*/i;
    extractedText = extractedText.replace(unwantedPrefixRegex, '');

    return response.status(200).json({ text: extractedText });
  } catch (error: any) {
    console.error('Error in OCR function:', error);
    return response.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

