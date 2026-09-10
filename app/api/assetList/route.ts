
import { NextResponse } from 'next/server'
import { queryAssetList } from '../../utils/db/assetList'

export async function GET() {
  try {
    const rows = await queryAssetList()

    return NextResponse.json({ assetList: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
