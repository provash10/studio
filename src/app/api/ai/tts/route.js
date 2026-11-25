import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

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

		// 2. ElevenLabs Text-to-Speech API
		const {
			text,
			voiceId = "21m00Tcm4TlvDq8ikWAM", // Rachel default
			apiKey,
		} = await request.json();

		if (!text) {
			return NextResponse.json({ error: "Text is required" }, { status: 400 });
		}

		if (!apiKey) {
			return NextResponse.json(
				{
					error:
						"ElevenLabs API Key is required for ElevenLabs voice generation. Alternatively, use manual microphone recording.",
				},
				{ status: 400 },
			);
		}

		const elevenRes = await fetch(
			`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
			{
				method: "POST",
				headers: {
					Accept: "audio/mpeg",
					"xi-api-key": apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text,
					model_id: "eleven_multilingual_v2",
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75,
					},
				}),
			},
		);

		if (!elevenRes.ok) {
			const errText = await elevenRes.text();
			return NextResponse.json(
				{ error: `ElevenLabs Error: ${errText}` },
				{ status: elevenRes.status },
			);
		}

		const arrayBuffer = await elevenRes.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const fileName = `elevenlabs_${Date.now()}.mp3`;
		const filePath = path.join(voiceDir, fileName);
		await fs.writeFile(filePath, buffer);

		return NextResponse.json({
			success: true,
			fileName,
			url: `/voiceovers/${fileName}`,
			filePath,
			source: "ElevenLabs AI Voice",
		});
	} catch (error) {
		console.error("TTS generation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
