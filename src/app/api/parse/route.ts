import { NextResponse } from "next/server";

// Groq parse route — implemented in GR-012.
export async function POST() {
  return NextResponse.json(
    { error: "not implemented (see GR-012)" },
    { status: 501 }
  );
}
