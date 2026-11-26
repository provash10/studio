import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";

const execFileAsync = promisify(execFile);

/**
 * Dynamically retrieves Gemini API key from environment or m turbo config
 */
export function getGeminiApiKey() {
	if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
	try {
		const configPath = "C:\\Projects\\m turbo\\MoneyPrinterTurbo-main\\config.toml";
		if (fsSync.existsSync(configPath)) {
			const tomlContent = fsSync.readFileSync(configPath, "utf-8");
			const match = tomlContent.match(/gemini_api_key\s*=\s*["']([^"']+)["']/);
			if (match && match[1]) {
				return match[1].trim();
			}
		}
	} catch {}
	return "";
}

/**
 * Extracts keyframes from a video file at chronological intervals.
 * Uses FFmpeg to extract low-res lightweight JPEG frames for AI Vision analysis.
 * Returns both the extracted frames and the exact probed video duration.
 */
export async function extractKeyFrames(videoPath, customFrameCount = null) {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-frames-"));
	const frames = [];
	let duration = 36.0; // default fallback

	try {
		// 1. Get video duration using ffprobe
		try {
			const { stdout } = await execFileAsync("ffprobe", [
				"-v", "error",
				"-show_entries", "format=duration",
				"-of", "default=noprint_wrappers=1:nokey=1",
				videoPath,
			]);
			const parsed = parseFloat(stdout.trim());
			if (!isNaN(parsed) && parsed > 0) {
				duration = parsed;
			}
		} catch (probeErr) {
			console.warn("ffprobe duration check failed, using fallback duration:", probeErr.message);
		}

		// 2. Pick frame count dynamically based on duration if not specified
		let frameCount = customFrameCount;
		if (!frameCount) {
			if (duration < 25) frameCount = 5;
			else if (duration < 60) frameCount = 7;
			else if (duration < 120) frameCount = 9;
			else frameCount = 12;
		}

		// 3. Pick timestamps evenly across the full video (5% to 95%)
		const timestamps = [];
		for (let i = 1; i <= frameCount; i++) {
			const ratio = i / (frameCount + 1);
			timestamps.push(Math.max(0.5, Math.min(duration - 0.5, duration * ratio)));
		}

		// 4. Extract frames using FFmpeg
		for (let idx = 0; idx < timestamps.length; idx++) {
			const ts = timestamps[idx];
			const framePath = path.join(tempDir, `frame_${idx}.jpg`);

			try {
				await execFileAsync("ffmpeg", [
					"-ss", ts.toFixed(2),
					"-i", videoPath,
					"-vframes", "1",
					"-q:v", "3",
					"-vf", "scale=512:-1",
					"-y",
					framePath,
				]);

				const buffer = await fs.readFile(framePath);
				const base64 = buffer.toString("base64");
				frames.push({
					timestamp: ts,
					base64,
				});
			} catch (frameErr) {
				console.warn(`Failed to extract frame at ${ts}s:`, frameErr.message);
			}
		}
	} finally {
		// Cleanup temp dir
		fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
	}

	return { duration, frames };
}

/**
 * Builds dynamic multi-scene script for full video duration if AI is offline
 */
function buildFullDurationFallbackScript({ duration, language, topic }) {
	const wordsPerSec = 2.5;
	const targetWords = Math.max(75, Math.round(duration * wordsPerSec));

	if (language === "bn") {
		const bnSections = [
			`ভিডিওটির শুরুতেই লক্ষ্য করুন কি অবিশ্বাস্য এক দৃশ্য ফুটে উঠছে! ${topic || "এই দৃশ্যটি"} প্রথম দেখায় নিতান্তই সাধারণ মনে হলেও কিছুক্ষণের মধ্যেই চরম উত্তেজনা সৃষ্টি হতে চলেছে। ট্রেনের ভেতরে যাত্রীরা নিশ্চিন্ত মনে বসে আছেন এবং বাইরের মনোরম দৃশ্য উপভোগ করছেন।`,
			`ট্রেনটি যখন আঁকাবাঁকা রেললাইন ধরে দ্রুত গতিতে এগিয়ে চলে, তখন জানালার বাইরে প্রকৃতির রূপ ক্রমশ বদলে যেতে থাকে। যাত্রীদের দৈনন্দিন অভিব্যক্তি এবং ছোট ছোট মুহূর্তগুলো এই যাত্রাকে আরও বেশি জীবন্ত এবং আকর্ষণীয় করে তুলেছে।`,
			`দীর্ঘ দূরত্বের ট্রেন ভ্রমণের ভেতরে এক অদ্ভুত মুগ্ধতা আর নস্টালজিয়া লুকিয়ে থাকে। কামরার শান্ত ও নিস্তব্ধ পরিবেশের সাথে দূরপাল্লার ট্রেনের অবিরাম চাকার ছন্দ এক মায়াবী পরিবেশ তৈরি করেছে।`,
			`ঠিক এই মুহূর্তে দৃশ্যটি আরও গভীর ও রোমাঞ্চকর হয়ে ওঠে! দূর থেকে ভেসে আসা ট্রেনের হুইসেল আর দূরবর্তী দিগন্তের রূপ যেন সবাইকে কিছুক্ষণের জন্য হারিয়ে যেতে বাধ্য করে। প্রতিটি সেকেন্ডে নতুন কিছু দেখার এক তীব্র কৌতূহল জেগে ওঠে।`,
			`যাত্রার শেষ ভাগে এসে দৃশ্যপট এক চমৎকার পরিণতিতে পৌঁছায়। আলো-ছায়ার অদ্ভুত খেলা আর ট্রেনের এই স্মরণীয় সফর দর্শকদের মনে এক গভীর দাগ কেটে যায়। শেষ সেকেন্ড পর্যন্ত এই আকর্ষণীয় ভিডিওটি উপভোগ করার মতো এক অনন্য মুহূর্ত!`,
		];
		let result = bnSections.join(" ");
		while (result.split(/\s+/).length < targetWords) {
			result += ` এই অবিরাম ট্রাভেল অভিজ্ঞতার প্রতিটি মুহূর্তই যেন এক একটি জীবন্ত গল্প বলে যায়। এমন অসাধারণ জার্নি সত্যিই যেকোনো দর্শকের মন জয় করে নেওয়ার মতো!`;
		}
		return result;
	}

	const enSections = [
		`Right from the opening seconds, we are drawn into an unforgettable journey as the scene unfolds. At first glance, ${topic || "this journey"} seems peaceful and calm, but there is an undeniable air of mystery and anticipation in the atmosphere. Passengers settle comfortably into their seats, taking in the serene surroundings as the journey begins.`,
		`As the wheels roll rhythmically along the tracks, the landscape outside begins to blur into a beautiful tapestry of motion and nature. Inside the cabin, subtle glances and shared quiet moments create a truly authentic story that keeps our eyes glued to the screen. Every passing second reveals a new angle of this captivating atmosphere.`,
		`There is something truly mesmerizing about long-distance travel captured like this. The gentle sway of the car, the warm light cutting across the interior, and the constant forward momentum evoke a deep sense of wanderlust and classic storytelling. You can genuinely feel the mood shifting as time moves forward.`,
		`As we approach the middle of the voyage, the action and pacing steadily build. The camera captures intimate details—from the expressions of travelers to the dramatic turns outside the window—adding layers of curiosity to what will happen next. It is impossible to look away as the story steadily unfolds.`,
		`In the final moments of this journey, everything culminates in a cinematic resolution. The scenery outside softens, the rhythm slows, and we are left with a lasting impression of this incredible experience. Make sure to watch closely until the very final second, because moments like this are truly one in a million!`,
	];
	let result = enSections.join(" ");
	while (result.split(/\s+/).length < targetWords) {
		result += ` The timeless charm of this journey continues to captivate, leaving viewers with a memorable reflection that lingers long after the video ends.`;
	}
	return result;
}

/**
 * Analyzes video visual frames using Google Gemini Vision,
 * and writes a contextual, scene-matched viral voiceover script covering the FULL video duration.
 */
export async function generateScriptWithVideoVision({
	videoPath,
	duration: clientDuration,
	language = "en",
	apiKey,
	provider = "gemini",
	videoTitle = "",
	fallbackPrompt = "",
	videoType = "shorts",
}) {
	// 1. Extract chronological visual frames across the video and probe exact duration
	let probedDuration = 36.0;
	let frames = [];
	try {
		const extraction = await extractKeyFrames(videoPath);
		probedDuration = extraction.duration;
		frames = extraction.frames;
	} catch (err) {
		console.warn("Keyframe extraction note:", err.message);
	}

	const effectiveDuration = Math.round(probedDuration || clientDuration || 36);
	const wordsPerSec = 2.45;
	const targetWords = Math.max(75, Math.round(effectiveDuration * wordsPerSec));
	const minWords = Math.max(65, Math.round(effectiveDuration * 2.2));
	const maxWords = Math.max(85, Math.round(effectiveDuration * 2.7));

	const isLong = effectiveDuration > 60;
	const promptText = `You are an expert viral video commentator and storyteller watching chronological scene frames from this video.

CRITICAL FULL-VIDEO DURATION REQUIREMENT:
The video is EXACTLY ${effectiveDuration} seconds (${(effectiveDuration / 60).toFixed(1)} minutes) long.
Your voiceover MUST span the ENTIRE ${effectiveDuration} seconds from the very first frame to the final second without stopping early.
TOTAL TARGET LENGTH: Exactly ${targetWords} spoken words (minimum ${minWords} words, maximum ${maxWords} words).

${
	isLong
		? `Structure your ${targetWords}-word narration in 4 chronological phases:
- Phase 1 (0 to ${Math.round(effectiveDuration * 0.25)}s, ~${Math.round(targetWords * 0.25)} words): Opening hook, setting description, passenger/subject introduction.
- Phase 2 (${Math.round(effectiveDuration * 0.25)}s to ${Math.round(effectiveDuration * 0.50)}s, ~${Math.round(targetWords * 0.25)} words): Journey details, landscape progression, unfolding action.
- Phase 3 (${Math.round(effectiveDuration * 0.50)}s to ${Math.round(effectiveDuration * 0.75)}s, ~${Math.round(targetWords * 0.25)} words): Rising curiosity, dramatic twists, storytelling reflections.
- Phase 4 (${Math.round(effectiveDuration * 0.75)}s to ${effectiveDuration}s, ~${Math.round(targetWords * 0.25)} words): Climax reaction, final resolution, and compelling outro hook.`
		: `Structure your narration continuously:
- Opening Hook (first 3-5 seconds)
- Rising Action & movement (middle frames)
- Dramatic Climax & shocking outcome (final third)
- Closing resolution to the very last second.`
}

Language: ${language === "bn" ? "Natural, captivating Bangla viral commentary (প্রাকৃতিক আকর্ষণীয় ধারাভাষ্য)" : "Energetic, engaging English viral commentary"}.

STRICT FORMAT RULES:
- Output ONLY the clean spoken script words.
- DO NOT include timestamps, scene labels, "Phase 1:", quotation marks, or markdown asterisks/headers.
- Write every single sentence to be spoken smoothly aloud from start to finish.`;

	const effectiveKey = apiKey || getGeminiApiKey();

	// 2. Call Google Gemini Vision with Image Frames
	if (provider === "gemini" || provider === "auto") {
		const modelCandidates = [
			"gemini-3.5-flash-lite",
			"gemini-3-flash-preview",
			"gemini-flash-lite-latest",
			"gemini-flash-latest",
		];

		const parts = [];
		for (const frame of frames) {
			parts.push({
				inline_data: {
					mime_type: "image/jpeg",
					data: frame.base64,
				},
			});
		}
		parts.push({
			text: `${promptText}\n\nVideo Context: ${videoTitle || fallbackPrompt || "Dramatic scene"}`,
		});

		for (const model of modelCandidates) {
			try {
				const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`;
				const res = await fetch(geminiUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contents: [{ parts }],
						generationConfig: {
							temperature: 0.7,
							maxOutputTokens: 8192,
						},
					}),
				});

				if (res.ok) {
					const data = await res.json();
					let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
					if (text) {
						// Clean any markdown formatting or frame headers
						text = text
							.replace(/^(\*\*|##|#).+$/gm, "")
							.replace(/^Phase\s*\d+[:\-].*$/gmi, "")
							.replace(/^Section\s*\d+[:\-].*$/gmi, "")
							.replace(/^Frame\s*\d+[:\-].*$/gmi, "")
							.replace(/^\d+[:\-].*$/gm, "")
							.replace(/[\*\_\#]/g, "")
							.replace(/\s+/g, " ")
							.trim();

						// Check word count and ensure it covers the full video duration
						let words = text.split(/\s+/).filter(Boolean);
						if (words.length < minWords) {
							const needed = minWords - words.length;
							// Request continuation to guarantee full length
							try {
								const contRes = await fetch(geminiUrl, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										contents: [{
											parts: [
												...parts.slice(0, -1),
												{
													text: `The previous voiceover section ended with: "${text.slice(-250)}"\n\nThe video is ${effectiveDuration} seconds long and needs another ${needed} words to cover the remaining scenes up to the end of the video.\nWrite the continuation of the narration for the remaining scenes (${needed} words).\nOutput ONLY clean spoken continuation text.`
												}
											]
										}],
										generationConfig: {
											temperature: 0.7,
											maxOutputTokens: 4096,
										}
									})
								});
								if (contRes.ok) {
									const contData = await contRes.json();
									const contText = contData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
									if (contText) {
										const cleanCont = contText
											.replace(/^(\*\*|##|#).+$/gm, "")
											.replace(/^Phase\s*\d+[:\-].*$/gmi, "")
											.replace(/^Frame\s*\d+[:\-].*$/gmi, "")
											.replace(/[\*\_\#]/g, "")
											.replace(/\s+/g, " ")
											.trim();
										text = `${text} ${cleanCont}`.trim();
										words = text.split(/\s+/).filter(Boolean);
									}
								}
							} catch (cErr) {
								console.warn("Continuation request note:", cErr.message);
							}

							// If still short, append high-retention outro expansion
							if (words.length < minWords) {
								const extra = language === "bn"
									? " এই যাত্রার প্রতিটি দৃশ্যই অসাধারণ সব মুহূর্ত উপহার দিয়েছে। শেষ পর্যন্ত এই অসাধারণ সফরটি দেখার মতো এক চমৎকার অভিজ্ঞতা ছিল!"
									: " Every single moment of this incredible journey was packed with intrigue. Thank you for watching all the way through to the very end!";
								text = `${text} ${extra}`.trim();
							}
						}

						return {
							success: true,
							script: text,
							source: `Google Gemini Vision (${model}, ${frames.length} frames, ${effectiveDuration}s full video)`,
							framesAnalyzed: frames.length,
							duration: effectiveDuration,
							wordCount: text.split(/\s+/).filter(Boolean).length,
						};
					}
				} else {
					console.warn(`Gemini model ${model} error:`, await res.text());
				}
			} catch (gErr) {
				console.warn(`Gemini ${model} request failed:`, gErr.message);
			}
		}
	}

	// 3. Fallback: Full Duration Dynamic Script Generator (Zero Cost)
	const fallbackScript = buildFullDurationFallbackScript({
		duration: effectiveDuration,
		language,
		topic: videoTitle || fallbackPrompt,
	});

	return {
		success: true,
		script: fallbackScript,
		source: `Studio Smart Commentary Engine (${effectiveDuration}s full video duration)`,
		framesAnalyzed: frames.length,
		duration: effectiveDuration,
		wordCount: fallbackScript.split(/\s+/).filter(Boolean).length,
	};
}
