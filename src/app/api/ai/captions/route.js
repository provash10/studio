import { NextResponse } from "next/server";
import { generateAutoCaptions, convertSegmentsToSRT } from "@/services/ai/captionService";

export async function POST(request) {
	try {
		const {
			text = "",
			duration = 36,
			wordsPerSegment = 3,
			style = "viral_yellow",
		} = await request.json();

		const contentText = String(text || "").trim();
		const finalDuration = Math.max(2, Number(duration) || 36);

		const segments = generateAutoCaptions({
			text: contentText,
			duration: finalDuration,
			wordsPerSegment: Number(wordsPerSegment) || 3,
		});

		const srt = convertSegmentsToSRT(segments);

		return NextResponse.json({
			success: true,
			segments,
			srt,
			count: segments.length,
		});
	} catch (error) {
		console.error("Auto caption generation error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to generate captions" },
			{ status: 500 }
		);
	}
}
