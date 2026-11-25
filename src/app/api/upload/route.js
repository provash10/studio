import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { probeVideo } from "@/lib/ffmpeg";

export async function POST(request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const uploadDir = path.join(process.cwd(), "public", "uploads");
		await fs.mkdir(uploadDir, { recursive: true });

		const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const uniqueName = `${Date.now()}_${sanitizedOriginalName}`;
		const filePath = path.join(uploadDir, uniqueName);

		await fs.writeFile(filePath, buffer);

		// Probe video metadata
		const metadata = await probeVideo(filePath);

		return NextResponse.json({
			success: true,
			filename: uniqueName,
			url: `/uploads/${uniqueName}`,
			filePath,
			metadata,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
