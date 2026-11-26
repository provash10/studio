import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { generateScriptWithVideoVision } from "@/services/ai/videoVision";

export async function POST(request) {
	try {
		const {
			prompt,
			style = "dramatic",
			language = "bn",
			provider = "auto",
			apiKey,
			videoTitle = "",
			videoFilename = "",
			videoType = "shorts",
		} = await request.json();

		// Auto-detect Gemini API Key if none was passed
		let effectiveApiKey = apiKey;
		if (!effectiveApiKey) {
			if (process.env.GEMINI_API_KEY) {
				effectiveApiKey = process.env.GEMINI_API_KEY;
			} else {
				// Try reading gemini_api_key from C:\Projects\m turbo\MoneyPrinterTurbo-main\config.toml
				try {
					const configPath = "C:\\Projects\\m turbo\\MoneyPrinterTurbo-main\\config.toml";
					if (fs.existsSync(configPath)) {
						const tomlContent = fs.readFileSync(configPath, "utf-8");
						const match = tomlContent.match(/gemini_api_key\s*=\s*["']([^"']+)["']/);
						if (match && match[1]) {
							effectiveApiKey = match[1].trim();
						}
					}
				} catch {}
			}
		}

		// 1. If a video file exists, use AI Video Vision (Gemini / OpenAI watches the video scenes!)
		if (videoFilename) {
			const videoPath = path.join(process.cwd(), "public", "uploads", videoFilename);
			if (fs.existsSync(videoPath)) {
				const visionResult = await generateScriptWithVideoVision({
					videoPath,
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
					});
				}
			}
		}

		// 2. Fallback text-based prompt generation
		const systemInstruction = `You are a viral YouTube Shorts and Long-form video commentary scriptwriter specializing in Arman Raj / MrBeast high-retention voiceovers.
CRITICAL INSTRUCTION: DO NOT repeat or copy original dialogue verbatim. Rephrase and provide completely original transformative commentary based on the action.
Language: ${language === "bn" ? "Bangla (natural viral commentary)" : "English (viral Shorts narration)"}.
Pacing: Fast, punchy, curiosity-inducing, keeping viewers hooked with zero duplicate dialogue.`;

		// (A) Gemini Text Generation
		if (effectiveApiKey && (provider === "gemini" || provider === "auto")) {
			try {
				const geminiRes = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveApiKey}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contents: [
								{
									parts: [
										{
											text: `${systemInstruction}\n\nTask: Write a 35-45 second viral voiceover script for this video: ${prompt || videoTitle || "Exciting video"}. Style: ${style}. Output ONLY the script text.`,
										},
									],
								},
							],
						}),
					},
				);
				if (geminiRes.ok) {
					const gData = await geminiRes.json();
					const text = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
					if (text) {
						return NextResponse.json({
							success: true,
							script: text,
							source: "Google Gemini 1.5 Flash",
						});
					}
				}
			} catch (gErr) {
				console.warn("Gemini text call note:", gErr.message);
			}
		}

		// (B) Built-in High-Retention Template Fallback (Zero Cost, No API Key required)
		const topic = prompt || videoTitle || "এই অবিশ্বাস্য মুহূর্তটি";
		let generatedScript = "";

		if (language === "bn") {
			generatedScript = `ভিডিওর শুরুতেই দেখুন কি অবিশ্বাস্য এক কাণ্ড ঘটতে চলেছে! 
${topic} দেখলে আপনিও বিশ্বাস করতে পারবেন না নিজের চোখে। 
প্রথমে সবাই ভেবেছিল এটা নিতান্তই সাধারণ একটি ঘটনা, কিন্তু পরের সেকেন্ডেই যা ঘটলো তা দেখে সবার চোখ কপালে উঠে গেল! 
মনোযোগ দিয়ে শেষ পর্যন্ত দেখুন, কারণ এই ক্লাইম্যাক্সটি মিস করলে আপনি সত্যিই আফসোস করবেন!`;
		} else {
			generatedScript = `Wait until you see what happens next in this incredible moment! 
Everyone thought this was completely ordinary, but in just 3 seconds, things took a crazy turn! 
Watch closely right now because what happens at the end is going to blow your mind!`;
		}

		return NextResponse.json({
			success: true,
			script: generatedScript,
			source: "Studio AI Engine (Built-in)",
		});
	} catch (error) {
		console.error("Script generation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
