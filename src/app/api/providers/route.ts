import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoose';
import Provider from '../../../models/Provider';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const providers = await Provider.find().sort({ id: 1 });
    return NextResponse.json({ providers });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
