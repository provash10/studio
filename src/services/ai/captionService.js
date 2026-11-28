/**
 * Service to generate timed Auto Captions / Subtitles from video scripts.
 * Supports viral short segments, typewriter animation timing, and zero background/border styling.
 */

export function generateAutoCaptions({ text = "", duration = 30, wordsPerSegment = 3 }) {
	const clean = String(text || "").trim();
	if (!clean) return [];

	// Split by sentences and natural pause marks
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
			// Chunk into 3-4 words per caption segment
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
	const safeSec = Math.max(0, Number(seconds) || 0);
	const h = Math.floor(safeSec / 3600);
	const m = Math.floor((safeSec % 3600) / 60);
	const s = Math.floor(safeSec % 60);
	const ms = Math.floor((safeSec % 1) * 1000);
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

/**
 * Converts segments into progressive typewriter subtitle frames.
 * Generates progressive text accumulation across the segment duration so each word
 * appears like a live typewriter during playback.
 */
export function convertSegmentsToTypewriterSRT(segments = []) {
	const entries = [];
	let entryCount = 1;

	for (const seg of segments) {
		const words = String(seg.text || "").trim().split(/\s+/).filter(Boolean);
		if (words.length <= 1) {
			// Single word: display for full duration
			entries.push(
				`${entryCount++}\n${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n${seg.text}\n`
			);
			continue;
		}

		// Progressive word-by-word reveal (typewriter style)
		const duration = Math.max(0.4, seg.end - seg.start);
		const stepDuration = duration / words.length;

		for (let i = 0; i < words.length; i++) {
			const chunkText = words.slice(0, i + 1).join(" ");
			const chunkStart = seg.start + (i * stepDuration);
			const chunkEnd = (i === words.length - 1) ? seg.end : (seg.start + ((i + 1) * stepDuration));

			entries.push(
				`${entryCount++}\n${formatSRTTime(chunkStart)} --> ${formatSRTTime(chunkEnd)}\n${chunkText}\n`
			);
		}
	}

	return entries.join("\n");
}

/**
 * Returns ASS Force Style matching exact user requirements:
 * - Font size: 9-10 scale (approx 12-14 in 1080p canvas)
 * - Bold: Yes (Bold=1)
 * - Italic: Yes (Italic=1)
 * - Border: None (BorderStyle=1, Outline=0.8 for subtle contrast, no box border)
 * - Background Color: None (BackColour=&H00000000 transparent, no box background)
 */
export function getASSForceStyle({
	style = "typewriter_clean",
	fontSize = 12,
	position = "bottom",
	bold = true,
	italic = true,
} = {}) {
	// Font 9 compact scale
	const fs = Math.max(10, Math.min(16, Number(fontSize) || 12));
	let marginV = 32;
	let alignment = 2; // Bottom-center

	if (position === "center") {
		alignment = 5; // Mid-center
		marginV = 0;
	} else if (position === "top") {
		alignment = 8; // Top-center
		marginV = 45;
	}

	const boldFlag = bold ? 1 : 0;
	const italicFlag = italic ? 1 : 0;

	// Pure white text, NO background (&H00000000), NO box border (BorderStyle=1, minimal Outline=0.8 for crisp readability)
	return `FontName=Arial,Bold=${boldFlag},Italic=${italicFlag},FontSize=${fs},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=0.8,Shadow=0.5,BackColour=&H00000000,Alignment=${alignment},MarginV=${marginV}`;
}
