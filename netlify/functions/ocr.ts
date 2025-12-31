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
    // Using v1 API version and gemini-1.5-pro model (more stable than v1beta)
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API call failed: ${errorText}` }),
      };
    }

    const data = await response.json();
    
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

