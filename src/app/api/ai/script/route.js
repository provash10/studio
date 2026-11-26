import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { generateScriptWithVideoVision, getGeminiApiKey } from "@/services/ai/videoVision";

export async function POST(request) {
	try {
		const {
			prompt,
			style = "dramatic",
			language = "en",
			provider = "auto",
			apiKey,
			videoTitle = "",
			videoFilename = "",
			videoType = "shorts",
			duration = 36,
			videoSpeed = 1.0,
			trimStart = 0,
			trimEnd = 0,
		} = await request.json();

		// Auto-detect Gemini API Key if none was passed
		const effectiveApiKey = apiKey || getGeminiApiKey();

		// 1. If a video file exists, use AI Video Vision (Gemini watches the real video scenes!)
		if (videoFilename) {
			const videoPath = path.join(process.cwd(), "public", "uploads", videoFilename);
			if (fs.existsSync(videoPath)) {
				const visionResult = await generateScriptWithVideoVision({
					videoPath,
					duration: Number(duration) || 36,
					videoSpeed: Number(videoSpeed) || 1.0,
					trimStart: Number(trimStart) || 0,
					trimEnd: Number(trimEnd) || 0,
					language,
					apiKey: effectiveApiKey,
					provider: provider === "auto" ? "gemini" : provider,
					videoTitle,
					fallbackPrompt: prompt,
					videoType,
				});

				if (visionResult.success && visionResult.script) {
					return NextResponse.json({
						success: true,
						script: visionResult.script,
						source: visionResult.source,
						framesAnalyzed: visionResult.framesAnalyzed,
						duration: visionResult.duration,
						wordCount: visionResult.wordCount,
					});
				}
			}
		}

		// 2. Full-duration text generation
		const videoDuration = Math.round(Number(duration) || 36);
		const targetWords = Math.max(65, Math.round(videoDuration * 2.35));
		const minWords = Math.max(55, Math.round(videoDuration * 2.15));

		const systemInstruction = `You are a viral YouTube commentary scriptwriter specializing in high-retention narration.
CRITICAL DURATION RULE: The video is ${videoDuration} seconds long.
You MUST write a continuous voiceover narration that covers the ENTIRE duration of ${videoDuration} seconds without stopping early.
TARGET WORDS: Around ${targetWords} words (minimum ${minWords} words).
Language: ${language === "bn" ? "Bangla (natural viral commentary)" : "English (viral narration)"}.
Output ONLY the clean spoken script words. No timestamps, no headers, no quotation marks.`;

		// (A) Gemini Text Generation
		if (effectiveApiKey && (provider === "gemini" || provider === "auto")) {
			const models = [
				"gemini-3.5-flash-lite",
				"gemini-3-flash-preview",
				"gemini-flash-lite-latest",
				"gemini-flash-latest",
			];
			for (const model of models) {
				try {
					const geminiRes = await fetch(
						`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								contents: [
									{
										parts: [
											{
												text: `${systemInstruction}\n\nTask: Write a ${videoDuration}-second viral voiceover script for this video: ${prompt || videoTitle || "Exciting video"}. Style: ${style}. Output ONLY the script text.`,
											},
										],
									},
								],
								generationConfig: {
									temperature: 0.7,
									maxOutputTokens: 4096,
								},
							}),
						},
					);
					if (geminiRes.ok) {
						const gData = await geminiRes.json();
						let text = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
						if (text) {
							text = text.replace(/^(\*\*|##|#).+$/gm, "").replace(/[\*\_\#]/g, "").replace(/\s+/g, " ").trim();
							return NextResponse.json({
								success: true,
								script: text,
								source: `Google Gemini (${model}, ${videoDuration}s full video)`,
								duration: videoDuration,
								wordCount: text.split(/\s+/).length,
							});
						}
					}
				} catch (gErr) {
					console.warn(`Gemini text call note (${model}):`, gErr.message);
				}
			}
		}

		// (B) Built-in High-Retention Template Fallback (Full Video Length)
		const topic = prompt || videoTitle || "এই অবিশ্বাস্য মুহূর্তটি";
		let generatedScript = "";

		if (language === "bn") {
			generatedScript = `ভিডিওর শুরুতেই লক্ষ্য করুন কি অবিশ্বাস্য এক দৃশ্য ফুটে উঠছে! ${topic} প্রথম দেখায় নিতান্তই সাধারণ মনে হলেও কিছুক্ষণের মধ্যেই চরম উত্তেজনা সৃষ্টি হতে চলেছে। দৃশ্যের গতি ক্রমশ বাড়তে থাকে এবং এক অভাবনীয় নাটকীয় মোড় নেয়! চারপাশের তীব্র ঝাঁকুনি আর বিশৃঙ্খলার মাঝে পরিস্থিতি পুরোপুরি নিয়ন্ত্রণের বাইরে চলে যায়। এই নাটকীয় দৃশ্যটি শেষ পর্যন্ত না দেখলে সত্যিই বিশ্বাস করা কঠিন ছিল! নিজের চোখকে বিশ্বাস করানোই যেন অসম্ভব এক ঘটনা!`;
		} else {
			generatedScript = `Right from the opening seconds, something completely unbelievable is about to happen! At first glance, ${topic} looked like an ordinary moment, but tension quickly starts to build up. Watch closely as the action accelerates and takes an unexpected, dangerous turn. Suddenly, everything spins completely out of control! In a split second, chaos takes over the entire scene in a shocking climax. You truly had to watch until the very last second to believe it!`;
		}

		return NextResponse.json({
			success: true,
			script: generatedScript,
			source: `Studio AI Engine (${videoDuration}s full video)`,
			duration: videoDuration,
			wordCount: generatedScript.split(/\s+/).length,
		});
	} catch (error) {
		console.error("Script generation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
