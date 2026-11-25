import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export async function GET() {
	try {
		const bgmDir = path.join(process.cwd(), "public", "bgm");
		await fs.mkdir(bgmDir, { recursive: true });
		const files = await fs.readdir(bgmDir);
		const bgms = files
			.filter((f) => f.endsWith(".mp4") || f.endsWith(".mp3"))
			.map((f) => ({
				name: f,
				url: `/bgm/${f}`,
			}));

		return NextResponse.json({ bgms });
	} catch (error) {
		return NextResponse.json({ bgms: [] });
	}
}
