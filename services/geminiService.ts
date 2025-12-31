
/**
 * Extract text from image using Netlify Function (which calls the OCR API)
 * @param base64ImageData - Base64 encoded image data (without data URI prefix)
 * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns Extracted text from the image
 */
export const extractTextFromImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
  try {
    // Call Vercel API route (or Netlify Function if on Netlify)
    // This keeps the API key secure on the server side
    // Detect which platform we're on
    let functionUrl = '/api/ocr'; // Default to Vercel
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Check if we're on Netlify
      if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
        functionUrl = '/.netlify/functions/ocr';
      }
      // Otherwise use Vercel API route
    }
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: base64ImageData,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error("No text was extracted from the image. The response may be empty or blocked.");
    }
    
    return data.text;
  } catch (error: any) {
    console.error("Error calling OCR API:", error);
    if (error.message.includes('API key')) {
      throw new Error("The configured API key is not valid. Please check your configuration.");
    }
    throw new Error(`Failed to extract text from image. ${error.message}`);
  }
};
