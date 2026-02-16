import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  return NextResponse.json({
    mes: 'get ja'
  });
};
export const POST = async (req: NextRequest) => {
  return new Response('Not found', {
    status: 404
  });
};
