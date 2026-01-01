// Cloudflare Pages Function for OCR
// This file handles /api/ocr requests

export async function onRequestPost(context: any) {
  const { request, env } = context;

  // 设置 CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { base64Image, mimeType } = body;

    if (!base64Image || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'Missing base64Image or mimeType' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 从环境变量获取 API 密钥
    const deepseekKey = env.DEEPSEEK_API_KEY;
    const geminiKey = env.GEMINI_API_KEY;
    const apiKey = deepseekKey || geminiKey;
    const useDeepSeek = !!deepseekKey;

    // 调试日志（不记录实际密钥）
    console.log('Environment check:', {
      hasDEEPSEEK: !!deepseekKey,
      hasGEMINI: !!geminiKey,
      hasApiKey: !!apiKey,
      usingDeepSeek: useDeepSeek,
    });

    if (!apiKey) {
      console.error('API key not configured');
      return new Response(
        JSON.stringify({
          error:
            'API key not configured. Please set DEEPSEEK_API_KEY or GEMINI_API_KEY in Cloudflare Pages environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 根据使用的 API 选择不同的端点和请求格式
    if (useDeepSeek) {
      // DeepSeek API 目前不支持图片输入
      console.warn(
        'DeepSeek API does not support image input. Recommend using Gemini API for OCR.'
      );
      return new Response(
        JSON.stringify({
          error:
            'DeepSeek API does not support image OCR. Please use GEMINI_API_KEY instead for OCR functionality. Set GEMINI_API_KEY in Cloudflare Pages environment variables and remove DEEPSEEK_API_KEY.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Google Gemini API 配置
    // 只使用 v1beta API（v1 API 支持的模型较少，容易出错）
    // 按优先级尝试不同的模型
    const modelConfigs = [
      { version: 'v1beta', model: 'gemini-1.5-flash' },      // 最快，支持图片
      { version: 'v1beta', model: 'gemini-1.5-pro' },        // 高质量
      { version: 'v1beta', model: 'gemini-2.0-flash-exp' }, // 实验性，最新
      { version: 'v1beta', model: 'gemini-pro' },            // 基础模型
    ];

    const requestHeaders = {
      'Content-Type': 'application/json',
    };
    const requestBody = {
      contents: [
        {
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
        },
      ],
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
          if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content
          ) {
            extractedText = data.candidates[0].content.parts
              .map((part: any) => part.text || '')
              .join('');
          }

          // 移除不需要的前缀
          const unwantedPrefixRegex =
            /^(Based on the image provided, here is the text converted (to|into) Markdown( format)?:?|以下是图片中内容的文字转写：)\s*/i;
          extractedText = extractedText.replace(unwantedPrefixRegex, '');

          console.log(`Success with model: ${config.version}/${config.model}`);
          return new Response(JSON.stringify({ text: extractedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          // 记录错误，继续尝试下一个模型
          const errorText = await apiResponse.text();
          console.warn(
            `Model ${config.version}/${config.model} failed:`,
            errorText
          );
          lastError = {
            status: apiResponse.status,
            error: errorText,
          };
          // 继续尝试下一个模型
          continue;
        }
      } catch (error: any) {
        console.warn(
          `Model ${config.version}/${config.model} error:`,
          error.message
        );
        lastError = error;
        continue;
      }
    }

    // 所有模型都失败了
    console.error('All Gemini models failed. Last error:', lastError);
    let errorMessage =
      'All Gemini API models failed. Please check your API key and model availability.';
    if (lastError) {
      try {
        const errorData =
          typeof lastError.error === 'string'
            ? JSON.parse(lastError.error)
            : lastError.error;
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        if (lastError.error) {
          errorMessage = lastError.error.substring(0, 200);
        }
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: lastError?.status || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in OCR function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

// 处理 OPTIONS 请求（CORS preflight）
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

