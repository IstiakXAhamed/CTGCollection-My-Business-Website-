import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET current receipt template
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'receiptTemplate' }
    })

    return NextResponse.json({ templateId: setting?.value || '1' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Update receipt template
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmin can change receipt template' }, { status: 401 })
    }

    const { templateId } = await request.json()

    // Validate template ID (1-36 available templates)
    const validIds = Array.from({ length: 36 }, (_, i) => String(i + 1))
    if (!templateId || !validIds.includes(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    await prisma.siteSetting.upsert({
      where: { key: 'receiptTemplate' },
      update: { value: templateId },
      create: { key: 'receiptTemplate', value: templateId }
    })

    return NextResponse.json({ success: true, templateId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
