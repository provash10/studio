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
			cliffhangerHook = { enabled: false, start: 40.5, end: 43.0, text: "WAIT FOR IT... 🔥" },
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
			videoSpeed = 1.10, // Default 1.10x speed boost for video and audio sync
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
			// Text Overlay Props
			textOverlay = "",
			showTextOverlay = false,
			textPosition = { x: 50, y: 12 },
			textScale = 1.0,
			// Sticker Overlay Props
			stickerOverlay = "",
			showStickerOverlay = false,
			stickerPosition = { x: 85, y: 85 },
			stickerScale = 1.0,
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

		// Aspect ratio canvas calculations: 9:16 (Shorts), 16:9 (Long), 1:1 (Square), 4:3, 3:4, 21:9
		if (aspectRatio === "9:16") {
			tW = 1080;
			tH = 1920;
		} else if (aspectRatio === "1:1") {
			tW = 1080;
			tH = 1080;
		} else if (aspectRatio === "4:3") {
			tW = 1440;
			tH = 1080;
		} else if (aspectRatio === "3:4") {
			tW = 1080;
			tH = 1440;
		} else if (aspectRatio === "21:9") {
			tW = 2560;
			tH = 1080;
		} else {
			tW = 1920;
			tH = 1080;
		}

		const ffmpegArgs = [];
		let currentInputIndex = 0;
		const isHookActive = Boolean(cliffhangerHook && cliffhangerHook.enabled);
		let hookInputIdx = -1;
		let mainInputIdx = -1;
		let videoInputIdx = 0;

		// Input Handling: Dual-Input Instant Seeking for Option 3 Cliffhanger Hook
		if (isHookActive) {
			const hookStart = Math.max(0, Number(cliffhangerHook.start) || 40.5);
			const hookEnd = Math.max(hookStart + 0.5, Number(cliffhangerHook.end) || 43.0);
			const mainStart = trim.enabled ? Math.max(0, Number(trim.start) || 0) : 0;
			const mainEnd = (trim.enabled && trim.end > mainStart) ? Number(trim.end) : (metadata.duration || 45.58);

			// Input 0: Teaser Hook clip
			ffmpegArgs.push("-ss", hookStart.toFixed(2), "-to", hookEnd.toFixed(2), "-i", inputVideoPath);
			hookInputIdx = currentInputIndex++;

			// Input 1: Main Action clip
			ffmpegArgs.push("-ss", mainStart.toFixed(2), "-to", mainEnd.toFixed(2), "-i", inputVideoPath);
			mainInputIdx = currentInputIndex++;
			videoInputIdx = mainInputIdx;
		} else {
			if (trim.enabled && trim.start > 0) {
				ffmpegArgs.push("-ss", trim.start.toString());
			}
			if (trim.enabled && trim.end > trim.start) {
				ffmpegArgs.push("-to", trim.end.toString());
			}
			ffmpegArgs.push("-i", inputVideoPath);
			videoInputIdx = currentInputIndex++;
		}

		// Input 1 (Optional): BGM Track (looped)
		let bgmInputIdx = -1;
		if (bgmEnabled && bgmTrackName) {
			let bgmPath = path.join(bgmDir, bgmTrackName);
			let foundBgm = false;
			try {
				await fs.access(bgmPath);
				foundBgm = true;
			} catch {
				// Check uploadDir for custom uploaded audio
				const customUploadPath = path.join(uploadDir, bgmTrackName);
				try {
					await fs.access(customUploadPath);
					bgmPath = customUploadPath;
					foundBgm = true;
				} catch {}
			}

			if (foundBgm) {
				ffmpegArgs.push("-stream_loop", "-1", "-i", bgmPath);
				bgmInputIdx = currentInputIndex++;
			} else {
				console.warn("BGM track not found, skipping BGM input:", bgmPath);
			}
		}

		// Input 2 (Optional): Voiceover Audio Track
		let voiceInputIdx = -1;
		let voiceDuration = 0;
		if (voiceoverEnabled && voiceoverFileName) {
			const voicePath = path.join(voiceDir, voiceoverFileName);
			try {
				await fs.access(voicePath);
				const voiceMeta = await probeVideo(voicePath);
				voiceDuration = voiceMeta.duration || 0;
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
		let baseA = `[${videoInputIdx}:a]`;

		// 0. Action Cliffhanger Hook (Option 3: Stitches thrilling peak stunt to front with WAIT FOR IT... banner)
		if (isHookActive) {
			const hookText = cliffhangerHook.text || "WAIT FOR IT... 🔥";
			const safeHookText = String(hookText)
				.replace(/\\/g, "\\\\")
				.replace(/'/g, "'\\''")
				.replace(/:/g, "\\:")
				.replace(/%/g, "\\%");
			const hookFontSize = Math.max(24, Math.round(tH * 0.048));

			filters.push(`[${hookInputIdx}:v]drawtext=text='${safeHookText}':fontcolor=yellow:fontsize=${hookFontSize}:box=1:boxcolor=black@0.85:boxborderw=12:x='(w-text_w)/2':y='(h-text_h)*0.15'[vhook]`);
			filters.push(`[vhook][${mainInputIdx}:v]concat=n=2:v=1:a=0[vstitched]`);
			baseV = "[vstitched]";

			if (metadata.hasAudio && !muteOriginalAudio) {
				filters.push(`[${hookInputIdx}:a][${mainInputIdx}:a]concat=n=2:v=0:a=1[astitched]`);
				baseA = "[astitched]";
			}
		}

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

		// 6. Video Speed Shift (1.10x by default for fast viral pacing and breaking video fingerprint)
		const effectiveSpeed = Math.max(0.5, Math.min(2.0, Number(videoSpeed) || 1.10));
		if (effectiveSpeed !== 1.0) {
			filters.push(`${baseV}setpts=PTS/${effectiveSpeed.toFixed(3)}[vpts]`);
			baseV = "[vpts]";
		}

		// 6.5 Draw Text Overlay (Draggable Hook with Black Box & Yellow Text)
		if (showTextOverlay && textOverlay) {
			const posX = Math.max(5, Math.min(95, Number(textPosition?.x ?? 50)));
			const posY = Math.max(5, Math.min(95, Number(textPosition?.y ?? 12)));
			const tScale = Math.max(0.5, Math.min(3.0, Number(textScale) || 1.0));
			const fontSize = Math.max(16, Math.round(tH * 0.04 * tScale));

			// Clean special characters for FFmpeg drawtext
			const safeText = String(textOverlay)
				.replace(/\\/g, "\\\\")
				.replace(/'/g, "'\\''")
				.replace(/:/g, "\\:")
				.replace(/%/g, "\\%");

			filters.push(
				`${baseV}drawtext=text='${safeText}':fontcolor=yellow:fontsize=${fontSize}:box=1:boxcolor=black@0.85:boxborderw=${Math.round(12 * tScale)}:x='(w-text_w)*(${posX}/100)':y='(h-text_h)*(${posY}/100)'[vtext]`,
			);
			baseV = "[vtext]";
		}

		// 6.6 Draw Sticker Overlay (Draggable Emoji / Reaction Meme)
		if (showStickerOverlay && stickerOverlay) {
			const sPosX = Math.max(5, Math.min(95, Number(stickerPosition?.x ?? 85)));
			const sPosY = Math.max(5, Math.min(95, Number(stickerPosition?.y ?? 85)));
			const stScale = Math.max(0.5, Math.min(3.0, Number(stickerScale) || 1.0));
			const sSize = Math.max(20, Math.round(tH * 0.055 * stScale));

			const safeSticker = String(stickerOverlay)
				.replace(/\\/g, "\\\\")
				.replace(/'/g, "'\\''")
				.replace(/:/g, "\\:")
				.replace(/%/g, "\\%");

			filters.push(
				`${baseV}drawtext=text='${safeSticker}':fontsize=${sSize}:x='(w-text_w)*(${sPosX}/100)':y='(h-text_h)*(${sPosY}/100)'[vstick]`,
			);
			baseV = "[vstick]";
		}

		// Calculate target duration adjusted for video speed so FFmpeg never loops indefinitely
		let rawDuration = (trim.enabled && trim.end > trim.start)
			? (trim.end - trim.start)
			: (metadata.duration || 36.2);
		if (isHookActive) {
			const hookDur = Math.max(0.5, (Number(cliffhangerHook.end) || 43.0) - (Number(cliffhangerHook.start) || 40.5));
			rawDuration = hookDur + ((trim.enabled && trim.end > trim.start) ? (trim.end - trim.start) : (metadata.duration || 36.2));
		}
		const targetDuration = rawDuration / effectiveSpeed;

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

			if (effectiveSpeed !== 1.0) {
				origAudioFilters.push(`atempo=${effectiveSpeed.toFixed(3)}`);
			}

			if (stereoDelay > 0) {
				origAudioFilters.push(`adelay=0|${stereoDelay}`);
			}

			if (channelSwap) {
				origAudioFilters.push("pan=stereo|c0=c1|c1=c0");
			}

			const vol = Number.parseFloat(originalAudioVolume) || 0.35;
			origAudioFilters.push(`volume=${vol.toFixed(2)}`);

			filters.push(`${baseA}${origAudioFilters.join(",")}[aorig]`);
			audioMixLabels.push("[aorig]");
		}

		// (b) BGM Track (ducked when voiceover is present so narration is crystal clear)
		if (bgmInputIdx !== -1) {
			let bVol = Number.parseFloat(bgmVolume);
			if (Number.isNaN(bVol) || bVol <= 0) {
				bVol = voiceInputIdx !== -1 ? 0.12 : 0.25;
			} else if (voiceInputIdx !== -1 && bVol > 0.15) {
				bVol = 0.12; // Lower BGM volume when voiceover is present
			}
			filters.push(`[${bgmInputIdx}:a]volume=${bVol.toFixed(2)}[abgm]`);
			audioMixLabels.push("[abgm]");
		}

		// (c) Voiceover Track (boosted for crisp and clear speech + perfectly synced to video end)
		if (voiceInputIdx !== -1) {
			const vVol = Number.parseFloat(voiceoverVolume) || 1.4;
			const voiceFilters = [];

			// Perfect end-sync: adjust tempo so speech matches video duration exactly without cutting off early
			if (voiceDuration > 0 && targetDuration > 0) {
				const desiredVoiceDuration = Math.max(1, targetDuration - 0.3);
				const rawTempo = voiceDuration / desiredVoiceDuration;
				// Safe tempo range: 0.70x to 1.30x for crystal-clear natural speech
				const tempo = Math.max(0.70, Math.min(1.30, rawTempo));

				if (Math.abs(tempo - 1.0) > 0.02) {
					voiceFilters.push(`atempo=${tempo.toFixed(3)}`);
				}
			}

			voiceFilters.push(`volume=${vVol.toFixed(2)}`);
			filters.push(`[${voiceInputIdx}:a]${voiceFilters.join(",")}[avoice]`);
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
