import fs from "fs";

/**
 * Premium ElevenLabs Speech Synthesis.
 * Requires API key; provides highest quality human-like voice.
 */
export async function synthesizeElevenLabs({
	text,
	voiceId = "21m00Tcm4TlvDq8ikWAM",
	apiKey,
	modelId = "eleven_multilingual_v2",
	outputPath,
}) {
	if (!apiKey) {
		throw new Error("ElevenLabs API key is missing");
	}

	const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "audio/mpeg",
			"Content-Type": "application/json",
			"xi-api-key": apiKey,
		},
		body: JSON.stringify({
			text,
			model_id: modelId,
			voice_settings: {
				stability: 0.5,
				similarity_boost: 0.75,
				style: 0.0,
				use_speaker_boost: true,
			},
		}),
	});

	if (!res.ok) {
		const errJson = await res.json().catch(() => ({}));
		throw new Error(errJson.detail?.message || `ElevenLabs HTTP error ${res.status}`);
	}

	const buffer = Buffer.from(await res.arrayBuffer());
	fs.writeFileSync(outputPath, buffer);

	return {
		success: true,
		provider: "elevenlabs",
		voiceId,
		outputPath,
	};
}
