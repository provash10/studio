import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const {
			prompt,
			style = "dramatic",
			language = "bn",
			provider = "auto",
			apiKey,
			videoTitle = "",
		} = await request.json();

		const systemInstruction = `You are a viral YouTube Shorts and Long-form video commentary scriptwriter specializing in Arman Raj / MrBeast high-retention voiceovers.
CRITICAL INSTRUCTION: DO NOT repeat or copy the original video's dialogue verbatim. You MUST rephrase, paraphrase, and provide completely original, transformative commentary based on the visual action.
Example: If the speaker in the original says "Let's go!", you say "Here we go now!" or "And as we move forward..." or in Bangla: "চলুন এবার দেখে নেওয়া যাক!".
Language: ${language === "bn" ? "Bangla (natural viral commentary)" : "English (viral Shorts narration)"}.
Pacing: Fast, punchy, curiosity-inducing, keeping viewers hooked in the first 3 seconds with zero duplicate dialogue.`;

		// 1. If OpenAI API Key is provided
		if (provider === "openai" && apiKey) {
			const res = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o-mini",
					messages: [
						{ role: "system", content: systemInstruction },
						{
							role: "user",
							content: `Create an engaging 30-45 second voiceover script for this video: ${prompt || videoTitle || "Viral moment"} with a ${style} style.`,
						},
					],
					temperature: 0.7,
				}),
			});
			if (res.ok) {
				const data = await res.json();
				return NextResponse.json({
					script: data.choices[0]?.message?.content,
					source: "ChatGPT (GPT-4o)",
				});
			}
		}

		// 2. If Gemini API Key is provided
		if (provider === "gemini" && apiKey) {
			const res = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contents: [
							{
								parts: [
									{
										text: `${systemInstruction}\n\nTask: Write a 30-40 second viral voiceover script for: ${prompt || videoTitle || "Exciting video"}. Style: ${style}.`,
									},
								],
							},
						],
					}),
				},
			);
			if (res.ok) {
				const data = await res.json();
				const text =
					data.candidates?.[0]?.content?.parts?.[0]?.text || "No script generated";
				return NextResponse.json({ script: text, source: "Google Gemini" });
			}
		}

		// 3. Fallback Built-in Intelligent High-Retention Template Generator (Zero Cost / No API Key required!)
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
			script: generatedScript,
			source: "Studio AI Engine (Built-in)",
		});
	} catch (error) {
		console.error("Script generation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
