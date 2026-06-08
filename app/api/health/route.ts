import { NextResponse } from "next/server";

export async function GET() {
  // Vérification basique : l'application répond
  return NextResponse.json(
    { status: "ok", service: "cesizen", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
