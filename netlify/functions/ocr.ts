// @ts-nocheck - Netlify Functions runtime provides these globals (process, console, fetch)
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// This function will be called by Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Debug logging (only in development)
  if (process.env.NETLIFY_DEV) {
    console.log('=== OCR Function Called ===');
    console.log('Method:', event.httpMethod);
    console.log('Body length:', event.body?.length || 0);
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { base64Image, mimeType } = JSON.parse(event.body || '{}');
    
    // Debug logging
    if (process.env.NETLIFY_DEV) {
      console.log('MIME Type:', mimeType);
      console.log('Base64 length:', base64Image?.length || 0);
    }

    if (!base64Image || !mimeType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing base64Image or mimeType' }),
      };
    }

    // Get API key from environment variable (set in Netlify dashboard)
    // @ts-ignore - process.env is available in Netlify Functions runtime
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;
    
    // Debug logging (don't log the actual key!)
    if (process.env.NETLIFY_DEV) {
      console.log('API Key exists:', !!apiKey);
      console.log('Using:', apiKey ? (process.env.DEEPSEEK_API_KEY ? 'DEEPSEEK_API_KEY' : 'GEMINI_API_KEY') : 'none');
    }
    
    if (!apiKey) {
      console.error('API key not configured. Set DEEPSEEK_API_KEY or GEMINI_API_KEY in environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    // Call Google Gemini API for OCR
    // Try multiple model configurations with fallback
    const modelConfigs = [
      { version: 'v1beta', model: 'gemini-pro' },
      { version: 'v1beta', model: 'gemini-1.5-pro' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-pro' },
    ];

    let lastError: any = null;
    let response: any = null;
    let data: any = null;

    for (const config of modelConfigs) {
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
      
      try {
        if (process.env.NETLIFY_DEV) {
          console.log(`Trying model: ${config.version}/${config.model}`);
        }
        response = await fetch(apiUrl, {
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
        });

        if (response.ok) {
          // 成功，使用这个响应
          data = await response.json();
          if (process.env.NETLIFY_DEV) {
            console.log(`Success with model: ${config.version}/${config.model}`);
          }
          break; // 跳出循环
        } else {
          // 记录错误，继续尝试下一个模型
          const errorText = await response.text();
          if (process.env.NETLIFY_DEV) {
            console.warn(`Model ${config.version}/${config.model} failed:`, errorText);
          }
          lastError = {
            status: response.status,
            error: errorText
          };
          continue; // 继续尝试下一个模型
        }
      } catch (error: any) {
        if (process.env.NETLIFY_DEV) {
          console.warn(`Model ${config.version}/${config.model} error:`, error.message);
        }
        lastError = error;
        continue;
      }
    }

    // 如果所有模型都失败了
    if (!response || !response.ok || !data) {
      console.error('All Gemini models failed. Last error:', lastError);
      let errorMessage = 'All Gemini API models failed. Please check your API key and model availability.';
      if (lastError?.error) {
        try {
          const errorData = typeof lastError.error === 'string' ? JSON.parse(lastError.error) : lastError.error;
          if (errorData?.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          if (typeof lastError.error === 'string') {
            errorMessage = lastError.error.substring(0, 200);
          }
        }
      }
      return {
        statusCode: lastError?.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: errorMessage }),
      };
    }
    
    // Extract text from response
    let extractedText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      extractedText = data.candidates[0].content.parts
        .map((part: any) => part.text || '')
        .join('');
    }

    // Remove unwanted prefixes
    const unwantedPrefixRegex = /^(Based on the image provided, here is the text converted (to|into) Markdown( format)?:?|以下是图片中内容的文字转写：)\s*/i;
    extractedText = extractedText.replace(unwantedPrefixRegex, '');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ text: extractedText }),
    };
  } catch (error: any) {
    console.error('Error in OCR function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

