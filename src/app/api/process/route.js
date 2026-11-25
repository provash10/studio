import { NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { runFFmpeg, probeVideo } from "@/lib/ffmpeg";

export async function POST(request) {
	try {
		const data = await request.json();
		const {
			filename,
			aspectRatio = "16:9", // '16:9' (Long) or '9:16' (Shorts)
			resolution = "1080p", // '1080p' or '4K' or '720p'
			trim = { enabled: false, start: 0, end: 0 },
			// Anti-copyright visual techniques
			mirror = true,
			blackBgLayer = true, // The Arman Raj red-mark technique: solid black layer underneath + 94% centered overlay
			applyZoom = true, // 2% safe zoom with headroom protection enabled by default
			applyWavyMotion = false, // 3% soft motion
			colorFilter = "cinematic",
			brightness = 0.03,
			contrast = 1.05,
			saturation = 1.08,
			speedShift = true, // 1% speed shift to break audio-visual hash
			// Audio & Voiceover
			muteOriginalAudio = true, // Default to true: 100% mute original audio for zero copyright match!
			originalAudioVolume = 0.0,
			applyAudioEqualizer = true,
			stereoDelay = 20,
			channelSwap = false,
			bgmEnabled = true,
			bgmTrackName = "bg3.mp4",
			bgmVolume = 0.25,
			voiceoverEnabled = false,
			voiceoverFileName = null,
			voiceoverVolume = 1.2,
		} = data;

		if (!filename) {
			return NextResponse.json(
				{ error: "No video filename specified" },
				{ status: 400 },
			);
		}

		const uploadDir = path.join(process.cwd(), "public", "uploads");
		const processedDir = path.join(process.cwd(), "public", "processed");
		const bgmDir = path.join(process.cwd(), "public", "bgm");
		const voiceDir = path.join(process.cwd(), "public", "voiceovers");
		await fs.mkdir(processedDir, { recursive: true });

		const inputVideoPath = path.join(uploadDir, filename);

		// Verify input exists
		try {
			await fs.access(inputVideoPath);
		} catch {
			return NextResponse.json(
				{ error: "Input video not found" },
				{ status: 404 },
			);
		}

		const metadata = await probeVideo(inputVideoPath);

		// Resolve user's Documents/Studio directory
		const studioDocsDir = path.join(os.homedir(), "Documents", "Studio");
		await fs.mkdir(studioDocsDir, { recursive: true });

		// Calculate next sequential number: 1., 2., 3., etc.
		const existingFiles = await fs.readdir(studioDocsDir).catch(() => []);
		let nextNumber = 1;
		for (const f of existingFiles) {
			const match = f.match(/^(\d+)\./);
			if (match) {
				const num = Number.parseInt(match[1], 10);
				if (num >= nextNumber) nextNumber = num + 1;
			}
		}

		const rawTitle = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, " ");
		const cleanTitle = rawTitle.trim() || "Studio_Video";
		const outFileName = `${nextNumber}. ${cleanTitle}.mp4`;
		const outputVideoPath = path.join(processedDir, outFileName);
		const localDocPath = path.join(studioDocsDir, outFileName);

		// Determine target resolution
		let tW = 1920;
		let tH = 1080;
		if (resolution === "4K") {
			tW = 3840;
			tH = 2160;
		} else if (resolution === "720p") {
			tW = 1280;
			tH = 720;
		}

		// Aspect ratio switch: 16:9 vs 9:16 Shorts
		if (aspectRatio === "9:16") {
			const temp = tW;
			tW = tH;
			tH = temp;
		}

		const ffmpegArgs = [];
		let currentInputIndex = 0;

		// Input 0: Main Video
		if (trim.enabled && trim.start > 0) {
			ffmpegArgs.push("-ss", trim.start.toString());
		}
		if (trim.enabled && trim.end > trim.start) {
			ffmpegArgs.push("-to", trim.end.toString());
		}
		ffmpegArgs.push("-i", inputVideoPath);
		const videoInputIdx = currentInputIndex++;

		// Input 1 (Optional): BGM Track (looped)
		let bgmInputIdx = -1;
		if (bgmEnabled && bgmTrackName) {
			const bgmPath = path.join(bgmDir, bgmTrackName);
			try {
				await fs.access(bgmPath);
				ffmpegArgs.push("-stream_loop", "-1", "-i", bgmPath);
				bgmInputIdx = currentInputIndex++;
			} catch (e) {
				console.warn("BGM track not found, skipping BGM input:", bgmPath);
			}
		}

		// Input 2 (Optional): Voiceover Audio Track
		let voiceInputIdx = -1;
		if (voiceoverEnabled && voiceoverFileName) {
			const voicePath = path.join(voiceDir, voiceoverFileName);
			try {
				await fs.access(voicePath);
				ffmpegArgs.push("-i", voicePath);
				voiceInputIdx = currentInputIndex++;
			} catch (e) {
				console.warn(
					"Voiceover track not found, skipping voiceover input:",
					voicePath,
				);
			}
		}

		// Filter complex chain
		const filters = [];
		let baseV = `[${videoInputIdx}:v]`;

		// 1. Horizontal Flip (Mirror)
		if (mirror) {
			filters.push(`${baseV}hflip[vflip]`);
			baseV = "[vflip]";
		}

		// 2. Safe Zoom & Headroom Protection (Docs formula: 1.02x with top headroom anchor)
		if (applyZoom) {
			filters.push(
				`${baseV}crop=w='2*trunc(iw/1.02/2)':h='2*trunc(ih/1.02/2)':x='(in_w-out_w)/2':y='(in_h-out_h)*0.05',scale=w='2*trunc(iw*1.02/2)':h='2*trunc(ih*1.02/2)'[vzoom]`,
			);
			baseV = "[vzoom]";
		}

		// 3. Gentle Motion (Docs formula: 1.03x gentle motion)
		if (applyWavyMotion) {
			filters.push(
				`${baseV}crop=w='2*trunc(iw/1.03/2)':h='2*trunc(ih/1.03/2)':x='(in_w-out_w)/2+((in_w-out_w)/4)*sin(t*0.5)':y='(in_h-out_h)*0.05+((in_h-out_h)*0.03)*sin(t*0.2)',scale=w='2*trunc(iw*1.03*0.96/2)':h='2*trunc(ih*1.03*0.96/2)',pad=w='2*trunc(iw/0.96/2)':h='2*trunc(ih/0.96/2)':x='2*trunc(iw/0.96*0.02/2)':y='2*trunc(ih/0.96*0.02/2)':color=black[vmotion]`,
			);
			baseV = "[vmotion]";
		}

		// 4. Color Grading & Equalization (Brightness, Contrast, Saturation)
		const b = brightness.toFixed(2);
		const c = contrast.toFixed(2);
		const s = saturation.toFixed(2);
		let colorGrade = `eq=brightness=${b}:contrast=${c}:saturation=${s}`;

		if (colorFilter === "cinematic") {
			colorGrade += ",curves=all='0/0 0.5/0.46 1/0.95'";
		} else if (colorFilter === "vivid") {
			colorGrade += ",curves=all='0/0 0.5/0.55 1/1'";
		} else if (colorFilter === "warm") {
			colorGrade += ",colorbalance=rs=0.08:gs=0.02:bs=-0.06";
		}
		filters.push(`${baseV}${colorGrade}[vcolor]`);
		baseV = "[vcolor]";

		// 5. Black Background Layer & Framing (The Arman Raj Red-Mark CapCut Method)
		if (blackBgLayer) {
			// Scales main video to 94% and nests it inside a solid black canvas layer of target size
			filters.push(
				`${baseV}scale=${tW}*0.94:${tH}*0.94:force_original_aspect_ratio=decrease[vscaled]`,
			);
			filters.push(
				`[vscaled]pad=${tW}:${tH}:(ow-iw)/2:(oh-ih)/2:color=black[vbgframe]`,
			);
			baseV = "[vbgframe]";
		} else {
			// Direct format scaling with black padding
			filters.push(
				`${baseV}scale=${tW}:${tH}:force_original_aspect_ratio=decrease,pad=${tW}:${tH}:(ow-iw)/2:(oh-ih)/2:color=black[vbgframe]`,
			);
			baseV = "[vbgframe]";
		}

		// 6. PTS Speed Shift (1.01x / setpts=0.99*PTS to break exact timing matching)
		if (speedShift) {
			filters.push(`${baseV}setpts=0.99*PTS[vpts]`);
			baseV = "[vpts]";
		}

		// 7. Audio Processing & Mixing
		const audioMixLabels = [];

		// (a) Original Audio (MUTED by default to eliminate copyright)
		if (!muteOriginalAudio && Number.parseFloat(originalAudioVolume) > 0 && metadata.hasAudio) {
			const origAudioFilters = [];
			origAudioFilters.push("aformat=channel_layouts=stereo");

			if (applyAudioEqualizer) {
				origAudioFilters.push(
					"bass=g=5:f=110:w=20,firequalizer=gain_entry='entry(0,-23);entry(250,-11.5);entry(6000,0);entry(12000,8);entry(16000,16)',aecho=1:0.6:2:0.4",
				);
			}

			if (speedShift) {
				origAudioFilters.push("atempo=1.01");
			}

			if (stereoDelay > 0) {
				origAudioFilters.push(`adelay=0|${stereoDelay}`);
			}

			if (channelSwap) {
				origAudioFilters.push("pan=stereo|c0=c1|c1=c0");
			}

			const vol = Number.parseFloat(originalAudioVolume) || 0.35;
			origAudioFilters.push(`volume=${vol.toFixed(2)}`);

			filters.push(`[${videoInputIdx}:a]${origAudioFilters.join(",")}[aorig]`);
			audioMixLabels.push("[aorig]");
		}

		// (b) BGM Track
		if (bgmInputIdx !== -1) {
			const bVol = Number.parseFloat(bgmVolume) || 0.25;
			filters.push(`[${bgmInputIdx}:a]volume=${bVol.toFixed(2)}[abgm]`);
			audioMixLabels.push("[abgm]");
		}

		// (c) Voiceover Track
		if (voiceInputIdx !== -1) {
			const vVol = Number.parseFloat(voiceoverVolume) || 1.2;
			filters.push(`[${voiceInputIdx}:a]volume=${vVol.toFixed(2)}[avoice]`);
			audioMixLabels.push("[avoice]");
		}

		// Audio Mix Combine
		let finalAudioLabel = "";
		if (audioMixLabels.length > 1) {
			filters.push(
				`${audioMixLabels.join("")}amix=inputs=${audioMixLabels.length}:duration=first:dropout_transition=2[aout]`,
			);
			finalAudioLabel = "[aout]";
		} else if (audioMixLabels.length === 1) {
			finalAudioLabel = audioMixLabels[0];
		} else {
			// If everything is muted and no audio tracks exist, create silent audio track
			filters.push(`aevalsrc=0:d=${Math.ceil(targetDuration)}[asilence]`);
			finalAudioLabel = "[asilence]";
		}

		// Calculate target duration so FFmpeg never runs into infinite BGM loop
		const targetDuration = (trim.enabled && trim.end > trim.start)
			? (trim.end - trim.start)
			: (metadata.duration || 36.2);

		// Assemble FFmpeg execution args
		ffmpegArgs.push("-filter_complex", filters.join(";"));
		ffmpegArgs.push("-map", baseV);
		if (audioMixLabels.length > 0) {
			ffmpegArgs.push("-map", finalAudioLabel);
			ffmpegArgs.push("-c:a", "aac", "-b:a", "192k");
		}
		ffmpegArgs.push(
			"-c:v",
			"libx264",
			"-preset",
			"veryfast",
			"-crf",
			"23",
			"-pix_fmt",
			"yuv420p",
			"-shortest", // Stop encoding as soon as the shortest stream ends
			"-t",
			Math.ceil(targetDuration).toString(), // Absolute duration limit
			"-map_metadata",
			"-1", // Clear metadata for 100% clean identity
			"-movflags",
			"+faststart",
			"-y",
			outputVideoPath,
		);

		console.log("processing video with selected filters and audio mix");
		await runFFmpeg(ffmpegArgs);

		// Copy directly to user's Documents/Studio folder as "1. <title>.mp4"
		try {
			await fs.copyFile(outputVideoPath, localDocPath);
			console.log("video saved to documents studio folder");
		} catch (copyErr) {
			console.warn("could not copy to documents studio folder");
		}

		return NextResponse.json({
			success: true,
			filename: outFileName,
			url: `/processed/${outFileName}`,
			localDocPath,
			message: `Exported successfully! Saved to Documents/Studio as "${outFileName}"`,
		});
	} catch (error) {
		console.error("Video processing error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to process video" },
			{ status: 500 },
		);
	}
}
