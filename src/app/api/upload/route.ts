import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (PNG, JPG, WEBP, GIF, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const cleanName = (file.name || 'image')
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');
    const ext = path.extname(cleanName) || '.png';
    const baseName = path.basename(cleanName, ext).substring(0, 30);
    const filename = `${baseName}-${Date.now()}${ext}`;

    // 1. Save to macee-admin-portal/public/uploads
    const adminUploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(adminUploadDir)) {
      fs.mkdirSync(adminUploadDir, { recursive: true });
    }
    const adminFilePath = path.join(adminUploadDir, filename);
    fs.writeFileSync(adminFilePath, buffer);

    // 2. Also save directly to macee-_update_contant/public/uploads for website sync
    const websitePublicUploadDir = path.resolve('d:/J&F/Maceee/macee-_update_contant/public/uploads');
    try {
      if (!fs.existsSync(websitePublicUploadDir)) {
        fs.mkdirSync(websitePublicUploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(websitePublicUploadDir, filename), buffer);
    } catch (e) {
      console.warn('Could not copy directly to website public uploads:', e);
    }

    // 3. Also save to macee-_update_contant/dist/uploads if dist exists
    const websiteDistUploadDir = path.resolve('d:/J&F/Maceee/macee-_update_contant/dist/uploads');
    try {
      if (fs.existsSync(path.dirname(websiteDistUploadDir))) {
        if (!fs.existsSync(websiteDistUploadDir)) {
          fs.mkdirSync(websiteDistUploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(websiteDistUploadDir, filename), buffer);
      }
    } catch (e) {
      console.warn('Could not copy directly to website dist uploads:', e);
    }

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
