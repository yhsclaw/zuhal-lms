import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { saveSchedulePhoto } from "@/server/services/pdf";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("zuhal-session")?.value;
  if (!sessionToken || !(await verifySession(sessionToken))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveSchedulePhoto(file.name, buffer);

  return NextResponse.json({ filePath });
}
