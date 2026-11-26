import path from "path";
import fs from "fs";
import { synthesizeEdgeTTS } from "./edgeTTS";
import { synthesizeElevenLabs } from "./elevenLabs";
import { synthesizeSystemTTS } from "./systemTTS";
import voicesCatalog from "./voices.json";

/**
 * Unified Voice Service Hub
 * Supports Free Edge-TTS (Bangla/English), Premium ElevenLabs, and Offline Fallback.
 */
export async function generateSpeech({
	text,
	provider = "edge", // 'edge', 'elevenlabs', 'system', 'auto'
	voice = "bn-BD-PradeepNeural",
	apiKey,
	rate = 1.0,
	outputDir = path.join(process.cwd(), "public", "temp"),
}) {
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const fileName = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.mp3`;
	const outputPath = path.join(outputDir, fileName);

	// Provider routing:
	// 1. If provider is explicitly elevenlabs and apiKey is provided -> ElevenLabs
	if (provider === "elevenlabs" && apiKey) {
		try {
			await synthesizeElevenLabs({
				text,
				voiceId: voice || "21m00Tcm4TlvDq8ikWAM",
				apiKey,
				outputPath,
			});
			return {
				success: true,
				fileName,
				url: `/temp/${fileName}`,
				provider: "elevenlabs",
				voice,
			};
		} catch (err) {
			console.warn("ElevenLabs failed, falling back to Free Edge-TTS:", err.message);
		}
	}

	// 2. Default to Free Edge-TTS (high-quality Microsoft neural voice, zero cost)
	try {
		await synthesizeEdgeTTS({
			text,
			voice: voice.includes("Neural") ? voice : "bn-BD-PradeepNeural",
			rate,
			outputPath,
		});
		return {
			success: true,
			fileName,
			url: `/temp/${fileName}`,
			provider: "edge-tts",
			voice: voice.includes("Neural") ? voice : "bn-BD-PradeepNeural",
		};
	} catch (edgeErr) {
		console.warn("Edge-TTS error, trying System TTS fallback:", edgeErr.message);
	}

	// 3. Fallback to System TTS (Windows offline)
	const wavFileName = fileName.replace(".mp3", ".wav");
	const wavOutputPath = path.join(outputDir, wavFileName);
	await synthesizeSystemTTS({
		text,
		outputPath: wavOutputPath,
	});

	return {
		success: true,
		fileName: wavFileName,
		url: `/temp/${wavFileName}`,
		provider: "system-tts",
		voice: "system-default",
	};
}

export function getVoiceCatalog() {
	return voicesCatalog;
}
