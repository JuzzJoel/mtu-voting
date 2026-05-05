import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '@/lib/auth/guards'
import { env } from '@/lib/env'
import { uploadRequestSchema } from '@/server/validators/admin'

function getS3Client() {
  if (
    !env.S3_REGION ||
    !env.S3_BUCKET ||
    !env.S3_ACCESS_KEY_ID ||
    !env.S3_SECRET_ACCESS_KEY
  ) {
    throw new Error('Missing storage configuration.')
  }

  return new S3Client({
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: env.S3_ENDPOINT || undefined,
  })
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = uploadRequestSchema.parse(await req.json())

    if (!env.S3_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: 'Missing public storage URL.' },
        { status: 500 }
      )
    }

    const extension = body.fileName.split('.').pop() || 'jpg'
    const objectKey = `nominees/${randomUUID()}.${extension}`
    const s3 = getS3Client()

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: objectKey,
      ContentType: body.fileType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
    const publicUrl = `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${objectKey}`

    return NextResponse.json({ uploadUrl, publicUrl })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upload not configured.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
