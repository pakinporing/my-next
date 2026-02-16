import { NextRequest, NextResponse } from 'next/server';

export const PUT = async (
  req: NextRequest,
  ctx: RouteContext<'/product/[id]'>
) => {
  const { id } = await ctx.params;
  const jsonBody = await req.json();
  const body = await req.formData();
  return NextResponse.json({
    mes: `put ja ${id}`
  });
};
