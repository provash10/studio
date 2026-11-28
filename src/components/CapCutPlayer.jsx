"use client";

import React, { useRef, useState, useEffect } from "react";
import {
	Play,
	Pause,
	Maximize2,
	Eye,
	Scan,
	Film,
	Sparkles,
	VolumeX,
	Volume2,
	Check,
	Zap,
	ShieldCheck,
	Loader2,
	Download,
} from "lucide-react";

export default function CapCutPlayer({
	videoUrl,
	aspectRatio = "9:16",
	setAspectRatio,
	mirror = true,
	blackBgLayer = true,
	applyZoom = false,
	colorFilter = "cinematic",
	brightness = 0.03,
	contrast = 1.05,
	saturation = 1.08,
	muteOriginalAudio = true,
	videoScale = 94,
	textOverlay = "",
	showTextOverlay = false,
	textPosition = { x: 50, y: 12 },
	setTextPosition,
	textScale = 1.0,
	setTextScale,
	stickerOverlay = "",
	showStickerOverlay = false,
	stickerPosition = { x: 85, y: 85 },
	setStickerPosition,
	stickerScale = 1.0,
	setStickerScale,
	autoCaption = { enabled: false, segments: [], style: "viral_yellow", position: "bottom", scale: 1.0 },
	currentTime = 0,
	duration = 36.22,
	onTimeUpdate,
	onDurationChange,
	seekTime = null,
	// Audio multi-track synchronization
	voiceoverFileName = null,
	voiceoverEnabled = true,
	voiceoverVolume = 1.4,
	bgmTrackName = "bg3.mp4",
	bgmEnabled = true,
	bgmVolume = 0.25,
	onGenerateVoice,
	isGeneratingVoice = false,
	// New requested buttons & preview states
	onCreateVideo,
	isCreatingVideo = false,
	creatingStatus = "",
	processedVideoUrl = null,
	previewMode = "raw", // 'raw' or 'copyright_free'
	setPreviewMode,
	onExport,
}) {
	const videoRef = useRef(null);
	const voiceAudioRef = useRef(null);
	const bgmAudioRef = useRef(null);
	const canvasRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [previewToast, setPreviewToast] = useState(false);
	const [isDraggingText, setIsDraggingText] = useState(false);

	// Drag event handlers for positioning text overlay
	const handleTextMouseDown = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setIsDraggingText(true);
	};

	const handleTextTouchStart = (e) => {
		e.stopPropagation();
		setIsDraggingText(true);
	};

	useEffect(() => {
		if (!isDraggingText) return;

		const handleMouseMove = (e) => {
			if (!canvasRef.current || !setTextPosition) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const xPct = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
			const yPct = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
			setTextPosition({ x: xPct, y: yPct });
		};

		const handleTouchMove = (e) => {
			if (!canvasRef.current || !setTextPosition || !e.touches[0]) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const touch = e.touches[0];
			const xPct = Math.max(5, Math.min(95, Math.round(((touch.clientX - rect.left) / rect.width) * 100)));
			const yPct = Math.max(5, Math.min(95, Math.round(((touch.clientY - rect.top) / rect.height) * 100)));
			setTextPosition({ x: xPct, y: yPct });
		};

		const handleEnd = () => {
			setIsDraggingText(false);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleEnd);
		window.addEventListener("touchmove", handleTouchMove);
		window.addEventListener("touchend", handleEnd);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleEnd);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleEnd);
		};
	}, [isDraggingText, setTextPosition]);

	// Drag event handlers for positioning sticker overlay
	const [isDraggingSticker, setIsDraggingSticker] = useState(false);

	const handleStickerMouseDown = (e) => {
		e.stopPropagation();
		e.preventDefault();
		setIsDraggingSticker(true);
	};

	const handleStickerTouchStart = (e) => {
		e.stopPropagation();
		setIsDraggingSticker(true);
	};

	useEffect(() => {
		if (!isDraggingSticker) return;

		const handleMouseMove = (e) => {
			if (!canvasRef.current || !setStickerPosition) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const xPct = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
			const yPct = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
			setStickerPosition({ x: xPct, y: yPct });
		};

		const handleTouchMove = (e) => {
			if (!canvasRef.current || !setStickerPosition || !e.touches[0]) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const touch = e.touches[0];
			const xPct = Math.max(5, Math.min(95, Math.round(((touch.clientX - rect.left) / rect.width) * 100)));
			const yPct = Math.max(5, Math.min(95, Math.round(((touch.clientY - rect.top) / rect.height) * 100)));
			setStickerPosition({ x: xPct, y: yPct });
		};

		const handleEnd = () => {
			setIsDraggingSticker(false);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleEnd);
		window.addEventListener("touchmove", handleTouchMove);
		window.addEventListener("touchend", handleEnd);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleEnd);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleEnd);
		};
	}, [isDraggingSticker, setStickerPosition]);

	const isCopyrightFreeActive = previewMode === "copyright_free" && Boolean(processedVideoUrl);
	const activeVideoSrc = isCopyrightFreeActive ? processedVideoUrl : videoUrl;

	const syncAudios = (shouldPlay) => {
		if (isCopyrightFreeActive) {
			if (voiceAudioRef.current) voiceAudioRef.current.pause();
			if (bgmAudioRef.current) bgmAudioRef.current.pause();
			return;
		}

		const curTime = videoRef.current ? videoRef.current.currentTime : 0;

		// 1. Synchronized Voiceover Audio
		if (voiceAudioRef.current && voiceoverFileName && voiceoverEnabled) {
			if (shouldPlay) {
				voiceAudioRef.current.currentTime = curTime;
				voiceAudioRef.current.volume = 1.0;
				voiceAudioRef.current.play().catch(() => {});
			} else {
				voiceAudioRef.current.pause();
			}
		}

		// 2. Synchronized BGM Audio (ducked under speech)
		if (bgmAudioRef.current && bgmEnabled && bgmTrackName) {
			if (shouldPlay) {
				if (bgmAudioRef.current.duration) {
					bgmAudioRef.current.currentTime = curTime % bgmAudioRef.current.duration;
				}
				bgmAudioRef.current.volume = voiceoverFileName ? 0.12 : (bgmVolume || 0.25);
				bgmAudioRef.current.loop = true;
				bgmAudioRef.current.play().catch(() => {});
			} else {
				bgmAudioRef.current.pause();
			}
		}
	};

	useEffect(() => {
		if (videoRef.current && seekTime !== null) {
			videoRef.current.currentTime = seekTime;
			if (voiceAudioRef.current) voiceAudioRef.current.currentTime = seekTime;
			if (bgmAudioRef.current && bgmAudioRef.current.duration) {
				bgmAudioRef.current.currentTime = seekTime % bgmAudioRef.current.duration;
			}
		}
	}, [seekTime]);

	// Auto-play when switching preview modes or setting new processed video
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
			syncAudios(true);
		}
	}, [previewMode, processedVideoUrl]);

	const togglePlay = () => {
		if (!videoRef.current) return;
		if (videoRef.current.paused) {
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
			syncAudios(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
			syncAudios(false);
		}
	};

	const triggerLivePreview = () => {
		setPreviewToast(true);
		setTimeout(() => setPreviewToast(false), 2000);
		if (setPreviewMode && processedVideoUrl) {
			setPreviewMode("copyright_free");
		}
		syncAudios(false);
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
		}
	};

	const formatCapCutTimecode = (seconds) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		const f = Math.floor((seconds % 1) * 30);
		return `${h.toString().padStart(2, "0")}:${m
			.toString()
			.padStart(2, "0")}:${s.toString().padStart(2, "0")}:${f
			.toString()
			.padStart(2, "0")}`;
	};

	let liveFilter = `brightness(${1 + brightness}) contrast(${contrast}) saturate(${saturation})`;
	if (colorFilter === "cinematic") {
		liveFilter += " sepia(0.12) hue-rotate(-5deg)";
	} else if (colorFilter === "vivid") {
		liveFilter += " saturate(1.25) contrast(1.1)";
	} else if (colorFilter === "warm") {
		liveFilter += " sepia(0.2) saturate(1.15)";
	}

	const scaleRatio = videoScale / 100;

	return (
		<div className="h-full flex flex-col bg-[#111215] select-none text-xs">
			{/* Top Bar: Action Buttons (Create Video, Preview Copyright-Free, Export) */}
			<div className="h-10 bg-[#141518] border-b border-[#212328] px-3 flex items-center justify-between text-slate-400 gap-2 shrink-0">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
						<Film className="w-3.5 h-3.5 text-[#00e5ff]" />
						<span>Player Canvas</span>
					</span>

					{/* Preview Switcher (Only visible when video is created) */}
					{processedVideoUrl && (
						<div className="flex items-center bg-[#1c1d22] p-0.5 rounded border border-[#2b2d35] ml-2">
							<button
								type="button"
								onClick={() => setPreviewMode && setPreviewMode("raw")}
								className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
									previewMode === "raw"
										? "bg-[#2b2d35] text-white"
										: "text-slate-400 hover:text-white"
								}`}
							>
								Raw Video
							</button>
							<button
								type="button"
								onClick={() => setPreviewMode && setPreviewMode("copyright_free")}
								className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
									previewMode === "copyright_free"
										? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
										: "text-emerald-400/70 hover:text-emerald-300"
								}`}
							>
								<ShieldCheck className="w-3 h-3 text-emerald-400" />
								<span>👁️ Copyright-Free Preview</span>
							</button>
						</div>
					)}
				</div>

				{/* Primary Action Buttons */}
				<div className="flex items-center gap-2">
					{/* Dedicated 1-Click AI Voice Generator Button */}
					<button
						type="button"
						onClick={onGenerateVoice}
						disabled={isGeneratingVoice || !videoUrl}
						className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer ${
							isGeneratingVoice
								? "bg-purple-950/80 text-purple-300 border border-purple-500/50 cursor-wait"
								: voiceoverFileName
								? "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/60"
								: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950"
						}`}
						title="Generate AI Commentary and Edge-TTS voiceover with instant audio preview"
					>
						{isGeneratingVoice ? (
							<>
								<Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
								<span>Generating Voice...</span>
							</>
						) : voiceoverFileName ? (
							<>
								<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
								<span>🎙️ Voice Active</span>
							</>
						) : (
							<>
								<span>🎙️ Create Voice</span>
							</>
						)}
					</button>

					{/* 1. The Main "Create Video" Button */}
					<button
						type="button"
						onClick={() => onCreateVideo && onCreateVideo({ forceNewVoice: true })}
						disabled={isCreatingVideo || !videoUrl}
						className={`px-3 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1.5 shadow transition-all cursor-pointer ${
							isCreatingVideo
								? "bg-[#202126] text-slate-400 cursor-not-allowed border border-[#2b2d35]"
								: processedVideoUrl
								? "bg-[#18191c] hover:bg-[#202227] text-[#00e5ff] border border-[#00e5ff]/60"
								: "bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] text-black hover:brightness-110 shadow-cyan-950"
						}`}
						title="Process video with all anti-copyright safeguards"
					>
						{isCreatingVideo ? (
							<>
								<Loader2 className="w-3.5 h-3.5 animate-spin text-[#00e5ff]" />
								<span>{creatingStatus || "Creating Video..."}</span>
							</>
						) : (
							<>
								<Zap className="w-3.5 h-3.5 fill-current" />
								<span>{processedVideoUrl ? "Re-Create Video" : "⚡ Create Video"}</span>
							</>
						)}
					</button>

					{/* 2. Preview Button */}
					{processedVideoUrl ? (
						<button
							type="button"
							onClick={triggerLivePreview}
							className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-black rounded text-[11px] font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
							title="Play the rendered copyright-free video"
						>
							<Eye className="w-3.5 h-3.5" />
							<span>👁️ Play Preview</span>
						</button>
					) : (
						<button
							type="button"
							onClick={triggerLivePreview}
							className="px-2.5 py-1 bg-[#1f2025] hover:bg-[#2b2d35] text-[#00e5ff] border border-[#00e5ff]/50 rounded text-[11px] font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
							title="Preview live effects"
						>
							<Eye className="w-3 h-3 text-[#00e5ff]" />
							<span>👁️ Preview</span>
						</button>
					)}
				</div>
			</div>

			{/* Center Viewport */}
			<div className="flex-1 relative flex items-center justify-center p-2 bg-[#0c0d10] overflow-hidden">
				<div
					ref={canvasRef}
					className="relative bg-black flex items-center justify-center shadow-2xl transition-all duration-200 border border-[#232429] mx-auto overflow-hidden"
					style={{
						aspectRatio:
							aspectRatio === "9:16"
								? "9 / 16"
								: aspectRatio === "1:1"
								? "1 / 1"
								: aspectRatio === "4:3"
								? "4 / 3"
								: aspectRatio === "3:4"
								? "3 / 4"
								: aspectRatio === "21:9"
								? "21 / 9"
								: "16 / 9",
						height: "100%",
						maxHeight: "380px",
						maxWidth:
							aspectRatio === "21:9"
								? "660px"
								: aspectRatio === "16:9"
								? "620px"
								: aspectRatio === "4:3"
								? "506px"
								: aspectRatio === "1:1"
								? "380px"
								: aspectRatio === "3:4"
								? "285px"
								: "214px",
						width: "100%",
					}}
				>
					{/* The Solid Black Base Layer (black.jpg) */}
					{blackBgLayer && !isCopyrightFreeActive && (
						<div className="absolute inset-0 bg-black z-0 pointer-events-none" />
					)}

					{activeVideoSrc ? (
						<>
							<video
								ref={videoRef}
								key={activeVideoSrc} // force reload when switching source
								src={activeVideoSrc}
								muted={isCopyrightFreeActive ? false : muteOriginalAudio}
								controls={false}
								className="relative z-10 w-full h-full object-contain"
								style={
									isCopyrightFreeActive
										? {} // Video is already rendered with all filters burned-in by FFmpeg
										: {
												transform: `${mirror ? "scaleX(-1)" : ""} scale(${
													blackBgLayer ? scaleRatio : 1
												}) ${applyZoom ? "scale(1.02)" : ""}`,
												transformOrigin: "center top",
												filter: liveFilter,
										  }
								}
								onPlay={() => syncAudios(true)}
								onPause={() => syncAudios(false)}
								onTimeUpdate={() => {
									if (videoRef.current && onTimeUpdate) {
										onTimeUpdate(videoRef.current.currentTime);
									}
								}}
								onLoadedMetadata={() => {
									if (videoRef.current && onDurationChange) {
										onDurationChange(videoRef.current.duration);
									}
								}}
								onSeeked={() => {
									if (voiceAudioRef.current && videoRef.current) {
										voiceAudioRef.current.currentTime = videoRef.current.currentTime;
									}
									if (bgmAudioRef.current && videoRef.current && bgmAudioRef.current.duration) {
										bgmAudioRef.current.currentTime = videoRef.current.currentTime % bgmAudioRef.current.duration;
									}
								}}
								onEnded={() => {
									setIsPlaying(false);
									syncAudios(false);
								}}
								playsInline
							/>

							{/* Synchronized Live Multi-Track Audio Elements */}
							{voiceoverFileName && (
								<audio
									ref={voiceAudioRef}
									key={voiceoverFileName}
									src={`/voiceovers/${voiceoverFileName}`}
									preload="auto"
								/>
							)}
							{bgmTrackName && (
								<audio
									ref={bgmAudioRef}
									key={bgmTrackName}
									src={`/bgm/${bgmTrackName}`}
									preload="auto"
									loop
								/>
							)}

						{/* Big Center Play Arrow Overlay when Paused */}
						{!isPlaying && (
							<div
								onClick={togglePlay}
								className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 hover:bg-black/35 transition-all cursor-pointer group"
							>
								<div className="w-14 h-14 rounded-full bg-[#00e5ff] group-hover:scale-110 group-hover:bg-[#33ebff] transition-all flex items-center justify-center shadow-2xl shadow-cyan-950/80">
									<Play className="w-7 h-7 text-black fill-black ml-1" />
								</div>
							</div>
						)}
					</>
					) : (
						<div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
							<Film className="w-8 h-8 text-slate-600" />
							<p className="text-[11px] text-slate-400">
								Import a video and click &ldquo;⚡ Create Video&rdquo; to begin
							</p>
						</div>
					)}

					{/* Banner when Copyright-Free Rendered Video is Active */}
					{isCopyrightFreeActive && (
						<div className="absolute top-2 left-2 z-20 pointer-events-none bg-emerald-950/90 border border-emerald-500/80 px-2.5 py-1 rounded text-[10px] text-emerald-300 font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
							<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
							<span>100% Anti-Copyright Verified Output (Sound Muted + BGM Mixed)</span>
						</div>
					)}

					{/* Auto Captions (Timed Subtitles Overlay with Typewriter Animation, Font 9, Bold, Italic, No Border, No BG) */}
					{autoCaption?.enabled && autoCaption?.segments?.length > 0 && !isCopyrightFreeActive && (() => {
						const currentSec = currentTime || 0;
						const activeSegment = autoCaption.segments.find(s => currentSec >= s.start && currentSec <= s.end);
						if (!activeSegment) return null;

						let posClasses = "bottom-[11%]";
						if (autoCaption.position === "center") posClasses = "top-1/2 -translate-y-1/2";
						else if (autoCaption.position === "top") posClasses = "top-[12%]";

						// Typewriter animation: calculate progressive reveal based on playback timestamp
						const segDur = Math.max(0.1, activeSegment.end - activeSegment.start);
						const elapsed = Math.max(0, currentSec - activeSegment.start);
						const progress = Math.min(1.0, elapsed / segDur);

						// Letter-by-letter / word-by-word typewriter slice
						const totalChars = activeSegment.text.length;
						const charsToShow = Math.max(1, Math.ceil(totalChars * progress));
						const typedText = activeSegment.text.slice(0, charsToShow);
						const isTyping = progress < 1.0;

						const customScale = Number(autoCaption.scale) || 1.0;
						const renderedFontSize = Math.max(8, Math.round(9 * customScale));

						return (
							<div
								className={`absolute left-1/2 -translate-x-1/2 z-30 select-none pointer-events-none text-center font-bold italic tracking-wide transition-all duration-75 max-w-[90%] whitespace-normal leading-tight bg-transparent border-0 shadow-none ${posClasses}`}
								style={{
									fontSize: `${renderedFontSize}px`,
									color: "#ffffff",
									textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)",
								}}
							>
								<span>{typedText}</span>
								{isTyping && (
									<span className="inline-block w-[1.5px] h-[9px] bg-white/90 animate-pulse ml-0.5 align-middle" />
								)}
							</div>
						);
					})()}

					{/* Text Overlay (Hook / Captions) - 100% Freely Draggable & Fixed Rigid Box */}
					{showTextOverlay && textOverlay && !isCopyrightFreeActive && (
						<div
							onMouseDown={handleTextMouseDown}
							onTouchStart={handleTextTouchStart}
							style={{
								position: "absolute",
								left: `${textPosition?.x ?? 50}%`,
								top: `${textPosition?.y ?? 12}%`,
								transform: `translate(-50%, -50%) scale(${textScale ?? 1.0})`,
								transformOrigin: "center center",
								whiteSpace: "nowrap",
								width: "max-content",
								maxWidth: "none",
								transition: isDraggingText ? "none" : "box-shadow 0.15s ease",
							}}
							className={`z-30 select-none px-3.5 py-1.5 bg-black/85 rounded-md border-2 border-yellow-400 text-yellow-300 font-extrabold text-xs sm:text-sm tracking-wide text-center uppercase shadow-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] whitespace-nowrap w-max cursor-grab active:cursor-grabbing group hover:border-[#00e5ff] hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] ${
								isDraggingText ? "cursor-grabbing border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.7)] ring-2 ring-[#00e5ff]" : ""
							}`}
							title="মাউস দিয়ে চেপে ধরে ড্র্যাগ করে পজিশন পরিবর্তন করুন"
						>
							<div className="flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
								<span className="text-[10px] text-[#00e5ff] opacity-80 font-mono">✥</span>
								<span className="whitespace-nowrap">{textOverlay}</span>
							</div>

							{/* Coordinate & Size Resize Tooltip (hidden while dragging to avoid lag/flicker) */}
							<div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-black/95 text-[#00e5ff] text-[9px] font-mono px-2 py-0.5 rounded-full border border-[#00e5ff]/50 whitespace-nowrap shadow-lg flex items-center gap-1.5 z-40 ${
								isDraggingText ? "hidden pointer-events-none" : "opacity-0 group-hover:opacity-100 transition-opacity"
							}`}>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										if (setTextScale) setTextScale(Math.max(0.5, Number(((textScale ?? 1.0) - 0.1).toFixed(1))));
									}}
									className="w-3.5 h-3.5 bg-[#25262c] hover:bg-[#353742] text-white rounded flex items-center justify-center font-bold text-[10px] cursor-pointer"
									title="ছোট করুন (Scale down)"
								>
									-
								</button>
								<span>{Math.round((textScale ?? 1.0) * 100)}%</span>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										if (setTextScale) setTextScale(Math.min(2.5, Number(((textScale ?? 1.0) + 0.1).toFixed(1))));
									}}
									className="w-3.5 h-3.5 bg-[#25262c] hover:bg-[#353742] text-white rounded flex items-center justify-center font-bold text-[10px] cursor-pointer"
									title="বড় করুন (Scale up)"
								>
									+
								</button>
							</div>
						</div>
					)}

					{/* Sticker Overlay (Reaction Meme) - Freely Draggable & Fixed Rigid Box */}
					{showStickerOverlay && stickerOverlay && !isCopyrightFreeActive && (
						<div
							onMouseDown={handleStickerMouseDown}
							onTouchStart={handleStickerTouchStart}
							style={{
								position: "absolute",
								left: `${stickerPosition?.x ?? 85}%`,
								top: `${stickerPosition?.y ?? 85}%`,
								transform: `translate(-50%, -50%) scale(${stickerScale ?? 1.0})`,
								transformOrigin: "center center",
								whiteSpace: "nowrap",
								width: "max-content",
								maxWidth: "none",
								transition: isDraggingSticker ? "none" : "transform 0.15s ease",
							}}
							className={`z-30 select-none text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] cursor-grab active:cursor-grabbing group whitespace-nowrap w-max ${
								isDraggingSticker ? "cursor-grabbing" : "hover:scale-105"
							}`}
							title="মাউস দিয়ে টেনে স্টিকারের পজিশন পরিবর্তন করুন"
						>
							<div className="relative pointer-events-none flex items-center justify-center whitespace-nowrap">
								<span className="whitespace-nowrap">{stickerOverlay}</span>
							</div>

							{/* Coordinate & Size Resize Tooltip for Sticker (hidden while dragging) */}
							<div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-black/95 text-[#00e5ff] text-[8.5px] font-mono px-2 py-0.5 rounded-full border border-[#00e5ff]/50 whitespace-nowrap shadow-lg flex items-center gap-1.5 z-40 ${
								isDraggingSticker ? "hidden pointer-events-none" : "opacity-0 group-hover:opacity-100 transition-opacity"
							}`}>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										if (setStickerScale) setStickerScale(Math.max(0.5, Number(((stickerScale ?? 1.0) - 0.1).toFixed(1))));
									}}
									className="w-3.5 h-3.5 bg-[#25262c] hover:bg-[#353742] text-white rounded flex items-center justify-center font-bold text-[10px] cursor-pointer"
									title="ছোট করুন (Scale down)"
								>
									-
								</button>
								<span>{Math.round((stickerScale ?? 1.0) * 100)}%</span>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										if (setStickerScale) setStickerScale(Math.min(2.8, Number(((stickerScale ?? 1.0) + 0.1).toFixed(1))));
									}}
									className="w-3.5 h-3.5 bg-[#25262c] hover:bg-[#353742] text-white rounded flex items-center justify-center font-bold text-[10px] cursor-pointer"
									title="বড় করুন (Scale up)"
								>
									+
								</button>
							</div>
						</div>
					)}

					{/* Live Preview Toast Notification */}
					{previewToast && (
						<div className="absolute top-3 bg-black/90 text-[#00e5ff] border border-[#00e5ff]/50 px-3 py-1 rounded-full text-[10px] font-bold z-30 flex items-center gap-1.5 shadow-lg animate-in fade-in">
							<Check className="w-3 h-3 text-[#00e5ff]" />
							<span>{isCopyrightFreeActive ? "Playing Copyright-Free Preview!" : "Live Preview Updated!"}</span>
						</div>
					)}

					{/* Active Rendering Progress Overlay */}
					{isCreatingVideo && (
						<div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center gap-2.5 backdrop-blur-sm p-4 text-center">
							<Loader2 className="w-7 h-7 text-[#00e5ff] animate-spin" />
							<div className="flex flex-col gap-1">
								<span className="text-white font-bold text-xs tracking-wide">
									{creatingStatus || "Creating Anti-Copyright Video..."}
								</span>
								<span className="text-slate-400 text-[10px]">
									Voice script + ElevenLabs/TTS voiceover + 8 visual defenses
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Scrubber Progress Bar with Playhead Arrow */}
			<div
				onClick={(e) => {
					if (!videoRef.current || duration <= 0) return;
					const rect = e.currentTarget.getBoundingClientRect();
					const clickX = e.clientX - rect.left;
					const ratio = Math.max(0, Math.min(1, clickX / rect.width));
					const targetTime = ratio * duration;
					videoRef.current.currentTime = targetTime;
					if (onTimeUpdate) onTimeUpdate(targetTime);
				}}
				className="h-2 bg-[#202228] relative cursor-pointer group hover:h-2.5 transition-all"
			>
				{/* Progress fill */}
				<div
					className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00e5ff] relative transition-all"
					style={{
						width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
					}}
				>
					{/* Playhead Arrow Handle */}
					<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center pointer-events-none">
						<span className="text-[#00e5ff] text-[10px] leading-none select-none">▼</span>
					</div>
				</div>
			</div>

			{/* Bottom Player Toolbar: Timecodes, Play Button, Aspect Ratio */}
			<div className="h-9 bg-[#18191c] border-t border-[#212328] px-3 flex items-center justify-between text-slate-400 shrink-0">
				{/* Left Timecode */}
				<div className="flex items-center gap-1.5 font-mono text-[11px]">
					<span className="text-[#00e5ff] font-semibold">
						{formatCapCutTimecode(currentTime)}
					</span>
					<span className="text-slate-400 font-medium">
						{formatCapCutTimecode(duration)}
					</span>
				</div>

				{/* Center Play/Pause Controls with Prominent Play Arrow */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={togglePlay}
						className="px-3.5 py-1 rounded-full bg-[#00e5ff] hover:bg-[#33ebff] text-black font-extrabold text-[11px] flex items-center gap-1.5 transition-all hover:scale-105 shadow-md shadow-cyan-950/60 cursor-pointer"
						title={isPlaying ? "Pause Preview" : "Play Preview"}
					>
						{isPlaying ? (
							<>
								<Pause className="w-3.5 h-3.5 fill-black" />
								<span>Pause ⏸</span>
							</>
						) : (
							<>
								<Play className="w-3.5 h-3.5 fill-black ml-0.5" />
								<span>Play ▶</span>
							</>
						)}
					</button>
				</div>

				{/* Right: Aspect Ratio Selector */}
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 text-[11px] text-slate-300 bg-[#25262c] px-2 py-0.5 rounded border border-[#2e3037]">
						<Scan className="w-3 h-3 text-slate-400" />
						<select
							value={aspectRatio}
							onChange={(e) => setAspectRatio(e.target.value)}
							className="bg-transparent text-slate-200 text-[11px] font-medium focus:outline-none cursor-pointer"
						>
							<option value="9:16">📱 9:16 (Shorts / Reels)</option>
							<option value="16:9">🖥️ 16:9 (Long Video)</option>
							<option value="1:1">⬛ 1:1 (Square Post)</option>
							<option value="4:3">📺 4:3 (Classic Video)</option>
							<option value="3:4">📄 3:4 (Portrait)</option>
							<option value="21:9">🎬 21:9 (Cinematic)</option>
						</select>
					</div>

					<button
						type="button"
						onClick={() => {
							if (videoRef.current) {
								if (videoRef.current.requestFullscreen) {
									videoRef.current.requestFullscreen();
								}
							}
						}}
						className="p-1 hover:text-white transition-colors"
						title="Fullscreen"
					>
						<Maximize2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
