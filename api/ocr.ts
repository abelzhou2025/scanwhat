// Vercel Serverless Function for OCR
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 设置 CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求（CORS preflight）
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, mimeType } = request.body;

    if (!base64Image || !mimeType) {
      return response.status(400).json({ 
        error: 'Missing base64Image or mimeType' 
      });
    }

    // 从环境变量获取 API 密钥
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = deepseekKey || geminiKey;
    const useDeepSeek = !!deepseekKey;
    
    // 调试日志（不记录实际密钥）
    console.log('Environment check:', {
      hasDEEPSEEK: !!deepseekKey,
      hasGEMINI: !!geminiKey,
      hasApiKey: !!apiKey,
      usingDeepSeek: useDeepSeek,
      envKeys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY'))
    });
    
    if (!apiKey) {
      console.error('API key not configured. Available env vars:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')));
      return response.status(500).json({ 
        error: 'API key not configured. Please set DEEPSEEK_API_KEY or GEMINI_API_KEY in Vercel environment variables.' 
      });
    }

    // 根据使用的 API 选择不同的端点和请求格式
    let apiUrl: string;
    let requestBody: any;
    let requestHeaders: Record<string, string>;

    if (useDeepSeek) {
      // DeepSeek API 配置
      apiUrl = 'https://api.deepseek.com/v1/chat/completions';
      requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // DeepSeek 使用 Bearer token
      };
      requestBody = {
        model: 'deepseek-chat', // 或 'deepseek-vision' 如果支持图片
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              },
              {
                type: 'text',
                text: 'Convert the document in the image to markdown, preserving the original text and structure as accurately as possible.'
              }
            ]
          }
        ],
        temperature: 0.1,
      };
    } else {
      // Google Gemini API 配置（原有逻辑）
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      requestHeaders = {
        'Content-Type': 'application/json',
      };
      requestBody = {
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
      };
    }

    // 调用 OCR API
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      // 提供更友好的错误信息
      let errorMessage = `API call failed: ${apiResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // 如果无法解析 JSON，使用原始文本
        if (errorText) {
          errorMessage = errorText.substring(0, 200); // 限制长度
        }
      }
      
      return response.status(apiResponse.status).json({ 
        error: errorMessage 
      });
    }

    const data = await apiResponse.json();
    
    // 提取文本（根据不同的 API 响应格式）
    let extractedText = '';
    
    if (useDeepSeek) {
      // DeepSeek API 响应格式
      if (data.choices && data.choices[0] && data.choices[0].message) {
        extractedText = data.choices[0].message.content || '';
      }
    } else {
      // Gemini API 响应格式（原有逻辑）
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        extractedText = data.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
      }
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

