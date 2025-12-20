import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Configure upload limits
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
]

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    // @ts-ignore
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for uploads' }, { status: 401 })
    }

    // 2. Parse Form Data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // 3. Enforce Security & Integrity via Sandboxing
    // Regular users are confined to their own folder: `users/{USER_ID}/{FOLDER}`
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, '') // Sanitize input
    const isSuper = user.role === 'superadmin'
    
    // Integrity: Ensure User A cannot overwrite User B's files by namespacing.
    const finalFolder = isSuper ? safeFolder : `users/${user.id}/${safeFolder}`

    // 4. Cloudinary Configuration
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET

    if (useCloudinary) {
      // @ts-ignore
      const { v2: cloudinary } = await import('cloudinary')
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })

      // Upload to Cloudinary
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      return new Promise<NextResponse>((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: `ctg-collection/${finalFolder}`, 
            resource_type: 'auto' 
          },
          (error: any, result: any) => {
            if (error) {
              console.error('Cloudinary Error:', error)
              resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }))
            } else {
              resolve(NextResponse.json({
                success: true,
                url: result?.secure_url,
                publicId: result?.public_id,
                fileName: file.name,
                size: file.size,
                type: file.type
              }))
            }
          }
        )
        uploadStream.end(buffer)
      })

    } else {
      // 5. Local Fallback (Dev/No-Cloud)
      // Still imposes the same folder structure for consistency
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${originalName}`

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', finalFolder)
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      return NextResponse.json({
        success: true,
        url: `/uploads/${finalFolder}/${fileName}`,
        fileName,
        type: file.type,
        warning: 'Using local storage (Ephemeral). Configure Cloudinary for production.'
      })
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - List files in a folder (Secure & Scoped)
export async function GET(request: NextRequest) {
  try {
    // 1. Verify Auth
    // @ts-ignore
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || '' 
    // folder param here is relative to their sandbox unless super admin

    // 2. Determine Secure Path
    let targetFolder = ''
    
    // Permission check for viewing OTHER people's files
    const canViewAll = user.role === 'superadmin' || user.permissions?.includes('manage_storage')
    
    if (canViewAll) {
      // Super admin can browse raw structure if they want, or user folders
      targetFolder = folder // Trust admin input (sanitized needed?)
    } else {
      // Regular user: strictly sandbox to their own folder
      // Even if they request "users/other-id", we ignore/error or just prepend their own.
      // We prepend their own path to guarantee isolation.
      const sanitizedReq = folder.replace(/[^a-zA-Z0-9-_/]/g, '')
      targetFolder = `users/${user.id}/${sanitizedReq}`
    }

    // Remove leading slashes/dots to prevent traversal
    targetFolder = targetFolder.replace(/^\/+|\.+/g, '')

    // 3. List Files (Cloudinary or Local)
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_SECRET

    if (useCloudinary) {
      // @ts-ignore
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      
      const result = await cloudinary.search
        .expression(`folder:ctg-collection/${targetFolder}/*`)
        .sort_by('created_at','desc')
        .max_results(50)
        .execute()
        
      return NextResponse.json({ 
        files: result.resources.map((r: any) => ({
          name: r.filename,
          url: r.secure_url,
          size: r.bytes,
          createdAt: r.created_at
        }))
      })

    } else {
      // Local listing
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', targetFolder)
      if (!existsSync(uploadDir)) {
        return NextResponse.json({ files: [] })
      }

      const fs = require('fs')
      const files = fs.readdirSync(uploadDir).map((name: string) => {
        const stats = fs.statSync(path.join(uploadDir, name))
        return {
          name,
          url: `/uploads/${targetFolder}/${name}`,
          size: stats.size,
          createdAt: stats.birthtime
        }
      })

      return NextResponse.json({ files })
    }
  } catch (error: any) {
    console.error('List files error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
