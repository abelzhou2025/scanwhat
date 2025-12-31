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
    if (useDeepSeek) {
      // DeepSeek API 目前不支持图片输入
      // 返回错误提示使用 Gemini API
      console.warn('DeepSeek API does not support image input. Recommend using Gemini API for OCR.');
      return response.status(400).json({ 
        error: 'DeepSeek API does not support image OCR. Please use GEMINI_API_KEY instead for OCR functionality. Set GEMINI_API_KEY in Vercel environment variables and remove DEEPSEEK_API_KEY.' 
      });
    }

    // Google Gemini API 配置
    // 尝试多个可能的模型和 API 版本组合
    const modelConfigs = [
      { version: 'v1beta', model: 'gemini-pro' },
      { version: 'v1beta', model: 'gemini-1.5-pro' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-pro' },
      { version: 'v1', model: 'gemini-1.5-pro' },
    ];

    const requestHeaders = {
      'Content-Type': 'application/json',
    };
    const requestBody = {
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

    // 尝试每个模型配置，直到成功
    let lastError: any = null;
    for (const config of modelConfigs) {
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
      
      try {
        console.log(`Trying model: ${config.version}/${config.model}`);
        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        });

        if (apiResponse.ok) {
          // 成功，使用这个响应
          const data = await apiResponse.json();
          
          let extractedText = '';
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            extractedText = data.candidates[0].content.parts
              .map((part: any) => part.text || '')
              .join('');
          }

          // 移除不需要的前缀
          const unwantedPrefixRegex = /^(Based on the image provided, here is the text converted (to|into) Markdown( format)?:?|以下是图片中内容的文字转写：)\s*/i;
          extractedText = extractedText.replace(unwantedPrefixRegex, '');

          console.log(`Success with model: ${config.version}/${config.model}`);
          return response.status(200).json({ text: extractedText });
        } else {
          // 记录错误，继续尝试下一个模型
          const errorText = await apiResponse.text();
          console.warn(`Model ${config.version}/${config.model} failed:`, errorText);
          lastError = {
            status: apiResponse.status,
            error: errorText
          };
          // 继续尝试下一个模型
          continue;
        }
      } catch (error: any) {
        console.warn(`Model ${config.version}/${config.model} error:`, error.message);
        lastError = error;
        continue;
      }
    }

    // 所有模型都失败了
    console.error('All Gemini models failed. Last error:', lastError);
    let errorMessage = 'All Gemini API models failed. Please check your API key and model availability.';
    if (lastError) {
      try {
        const errorData = typeof lastError.error === 'string' ? JSON.parse(lastError.error) : lastError.error;
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        if (lastError.error) {
          errorMessage = lastError.error.substring(0, 200);
        }
      }
    }
    
    return response.status(lastError?.status || 500).json({ 
      error: errorMessage 
    });
  } catch (error: any) {
    console.error('Error in OCR function:', error);
    return response.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

