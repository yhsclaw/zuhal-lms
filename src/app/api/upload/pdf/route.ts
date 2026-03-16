import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { savePdfFile } from "@/server/services/pdf";
import { prisma } from "@/server/db";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("zuhal-session")?.value;
  if (!sessionToken || !(await verifySession(sessionToken))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;

  if (!file || !title) {
    return NextResponse.json({ error: "Missing file or title" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await savePdfFile(file.name, buffer);

  const pdf = await prisma.pdfExercise.create({
    data: {
      title,
      fileName: file.name,
      filePath,
    },
  });

  return NextResponse.json(pdf);
}
