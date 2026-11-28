/**
 * Service to generate timed Auto Captions / Subtitles from video scripts.
 * Splits text into CapCut / TikTok viral short phrases and distributes timestamps evenly across duration.
 */

export function generateAutoCaptions({ text = "", duration = 30, wordsPerSegment = 3 }) {
	const clean = String(text || "").trim();
	if (!clean) return [];

	// Split by sentences and commas to preserve natural pauses
	const sentenceParts = clean
		.replace(/([.!?।]+)/g, "$1|")
		.split("|")
		.map(s => s.trim())
		.filter(Boolean);

	const phrases = [];
	for (const part of sentenceParts) {
		const words = part.split(/\s+/).filter(Boolean);
		if (words.length <= 4) {
			phrases.push(words.join(" "));
		} else {
			// Chunk into 3-4 words per caption
			for (let i = 0; i < words.length; i += wordsPerSegment) {
				const chunk = words.slice(i, i + wordsPerSegment);
				phrases.push(chunk.join(" "));
			}
		}
	}

	if (phrases.length === 0) return [];

	const totalWords = phrases.reduce((sum, p) => sum + p.split(/\s+/).length, 0);
	const safeDuration = Math.max(2, Number(duration) || 30);

	let currentSec = 0;
	const segments = phrases.map((phrase, idx) => {
		const phraseWordCount = phrase.split(/\s+/).length;
		const phraseRatio = phraseWordCount / totalWords;
		const phraseDuration = Math.max(1.0, phraseRatio * safeDuration);
		const start = Number(currentSec.toFixed(2));
		const end = Number(Math.min(safeDuration, currentSec + phraseDuration).toFixed(2));
		currentSec += phraseDuration;

		return {
			id: idx + 1,
			start,
			end: Math.max(start + 0.8, end),
			text: phrase,
		};
	});

	// Ensure final segment ends exactly at safeDuration
	if (segments.length > 0) {
		segments[segments.length - 1].end = Number(safeDuration.toFixed(2));
	}

	return segments;
}

function formatSRTTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const ms = Math.floor((seconds % 1) * 1000);
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export function convertSegmentsToSRT(segments = []) {
	return segments
		.map((seg, idx) => {
			const startStr = formatSRTTime(seg.start);
			const endStr = formatSRTTime(seg.end);
			return `${idx + 1}\n${startStr} --> ${endStr}\n${seg.text}\n`;
		})
		.join("\n");
}

export function getASSForceStyle({ style = "viral_yellow", fontSize = 24, position = "bottom" }) {
	const fs = Math.max(16, Number(fontSize) || 24);
	let marginV = 35;
	let alignment = 2; // Bottom-center

	if (position === "center") {
		alignment = 5; // Mid-center
		marginV = 0;
	} else if (position === "top") {
		alignment = 8; // Top-center
		marginV = 45;
	}

	switch (style) {
		case "classic_white":
			return `FontName=Arial,Bold=1,FontSize=${fs},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=2,Alignment=${alignment},MarginV=${marginV}`;
		case "neon_cyan":
			return `FontName=Arial,Bold=1,FontSize=${fs},PrimaryColour=&H00FFE500,BackColour=&H80000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=${alignment},MarginV=${marginV}`;
		case "green_meme":
			return `FontName=Arial,Bold=1,FontSize=${fs},PrimaryColour=&H005EC522,BackColour=&H80000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=${alignment},MarginV=${marginV}`;
		case "viral_yellow":
		default:
			return `FontName=Arial,Bold=1,FontSize=${fs},PrimaryColour=&H0000FFFF,BackColour=&H80000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=${alignment},MarginV=${marginV}`;
	}
}
