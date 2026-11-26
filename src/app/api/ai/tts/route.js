import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { generateSpeech, getVoiceCatalog } from "@/services/voice";

export async function GET() {
	return NextResponse.json({
		success: true,
		catalog: getVoiceCatalog(),
	});
}

export async function POST(request) {
	try {
		const contentType = request.headers.get("content-type") || "";
		const voiceDir = path.join(process.cwd(), "public", "voiceovers");
		await fs.mkdir(voiceDir, { recursive: true });

		// 1. Microphone recording / audio file upload
		if (contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			const audioFile = formData.get("audio");
			if (!audioFile) {
				return NextResponse.json(
					{ error: "No audio file provided" },
					{ status: 400 },
				);
			}

			const bytes = await audioFile.arrayBuffer();
			const buffer = Buffer.from(bytes);
			const fileName = `manual_voice_${Date.now()}.mp3`;
			const filePath = path.join(voiceDir, fileName);
			await fs.writeFile(filePath, buffer);

			return NextResponse.json({
				success: true,
				fileName,
				url: `/voiceovers/${fileName}`,
				filePath,
				source: "Manual Microphone Recording",
			});
		}

		// 2. Text-to-Speech using Modular Voice Service (Edge-TTS / ElevenLabs / System)
		const {
			text,
			provider = "auto", // 'auto', 'edge', 'elevenlabs', 'system'
			voice = "en-US-ChristopherNeural",
			voiceId,
			apiKey,
			rate = 1.0,
		} = await request.json();

		if (!text) {
			return NextResponse.json({ error: "Text is required" }, { status: 400 });
		}

		const chosenVoice = voiceId || voice;
		// Determine effective provider
		let effectiveProvider = provider;
		if (provider === "auto") {
			effectiveProvider = (apiKey && apiKey.trim().length > 5) ? "elevenlabs" : "edge";
		}

		const result = await generateSpeech({
			text,
			provider: effectiveProvider,
			voice: chosenVoice,
			apiKey,
			rate,
			outputDir: voiceDir,
		});

		return NextResponse.json({
			success: true,
			fileName: result.fileName,
			url: `/voiceovers/${result.fileName}`,
			filePath: path.join(voiceDir, result.fileName),
			source: result.provider === "edge-tts"
				? "Free AI Voice (Edge-TTS)"
				: result.provider === "elevenlabs"
					? "ElevenLabs AI Voice"
					: "System Audio (Offline)",
			voice: result.voice,
		});
	} catch (error) {
		console.error("TTS generation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
