import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Image editing route scaffolded but not yet implemented." },
    { status: 501 }
  );
}
