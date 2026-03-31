import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const pluginPath = join(process.cwd(), 'wordpress-plugin', 'vouchly.php')
    const fileContents = readFileSync(pluginPath)

    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="vouchly.php"',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Plugin file not found' }, { status: 404 })
  }
}
