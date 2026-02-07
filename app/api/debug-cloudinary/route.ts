
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Debug Cloudinary: Checking config...');

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const maskedSecret = apiSecret 
      ? `${apiSecret.substring(0, 3)}...${apiSecret.substring(apiSecret.length - 3)}` 
      : 'MISSING';

    const configStatus = {
      cloud_name: cloudName || 'MISSING',
      api_key: apiKey || 'MISSING',
      api_secret: maskedSecret,
    };

    console.log('Debug Cloudinary: Config status:', configStatus);

    // Attempt a test upload (1x1 pixel transparent GIF)
    const testUpload = await cloudinary.uploader.upload(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", 
      {
        folder: 'debug_test',
        public_id: `test_${Date.now()}`
      }
    );

    console.log('Debug Cloudinary: Upload success:', testUpload.secure_url);

    return NextResponse.json({
      status: 'success',
      env_check: configStatus,
      upload_result: testUpload
    });

  } catch (error: any) {
    console.error('Debug Cloudinary: Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      env_check: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
          api_key: process.env.CLOUDINARY_API_KEY || 'MISSING',
          api_secret: process.env.CLOUDINARY_API_SECRET ? 'PRESENT (Masked)' : 'MISSING'
      },
      error_detail: error
    }, { status: 500 });
  }
}
