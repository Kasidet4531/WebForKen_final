import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded?.split(",")[0] || realIp || "unknown"

    return NextResponse.json({ ip })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to track user" },
      { status: 500 }
    )
  }
}
