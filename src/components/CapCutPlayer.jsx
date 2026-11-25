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
	stickerOverlay = "",
	showStickerOverlay = false,
	currentTime = 0,
	duration = 36.22,
	onTimeUpdate,
	onDurationChange,
	seekTime = null,
	// New requested buttons & preview states
	onCreateVideo,
	isCreatingVideo = false,
	processedVideoUrl = null,
	previewMode = "raw", // 'raw' or 'copyright_free'
	setPreviewMode,
	onExport,
}) {
	const videoRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [previewToast, setPreviewToast] = useState(false);

	useEffect(() => {
		if (videoRef.current && seekTime !== null) {
			videoRef.current.currentTime = seekTime;
		}
	}, [seekTime]);

	// Auto-play when switching preview modes or setting new processed video
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
		}
	}, [previewMode, processedVideoUrl]);

	const togglePlay = () => {
		if (!videoRef.current) return;
		if (videoRef.current.paused) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
		}
	};

	const triggerLivePreview = () => {
		setPreviewToast(true);
		setTimeout(() => setPreviewToast(false), 2000);
		if (setPreviewMode && processedVideoUrl) {
			setPreviewMode("copyright_free");
		}
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
	const isCopyrightFreeActive = previewMode === "copyright_free" && Boolean(processedVideoUrl);
	const activeVideoSrc = isCopyrightFreeActive ? processedVideoUrl : videoUrl;

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
					{/* 1. The Main "Create Video" Button */}
					<button
						type="button"
						onClick={onCreateVideo}
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
								<span>Creating Video...</span>
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
					className={`relative bg-black flex items-center justify-center shadow-2xl transition-all duration-150 border border-[#232429] ${
						aspectRatio === "9:16"
							? "h-full max-h-[380px] aspect-[9/16]"
							: "w-full max-w-[620px] aspect-[16/9]"
					}`}
				>
					{/* The Solid Black Base Layer (black.jpg) */}
					{blackBgLayer && !isCopyrightFreeActive && (
						<div className="absolute inset-0 bg-black z-0 pointer-events-none" />
					)}

					{activeVideoSrc ? (
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
							onEnded={() => setIsPlaying(false)}
							playsInline
						/>
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

					{/* Text Overlay (Hook / Captions) */}
					{showTextOverlay && textOverlay && !isCopyrightFreeActive && (
						<div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 bg-black/80 rounded border-2 border-yellow-400 text-yellow-300 font-extrabold text-xs sm:text-sm tracking-wide text-center uppercase shadow-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[90%]">
							{textOverlay}
						</div>
					)}

					{/* Sticker Overlay (Reaction Meme) */}
					{showStickerOverlay && stickerOverlay && !isCopyrightFreeActive && (
						<div className="absolute bottom-12 right-4 z-20 pointer-events-none text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce">
							{stickerOverlay}
						</div>
					)}

					{/* Live Preview Toast Notification */}
					{previewToast && (
						<div className="absolute top-3 bg-black/90 text-[#00e5ff] border border-[#00e5ff]/50 px-3 py-1 rounded-full text-[10px] font-bold z-30 flex items-center gap-1.5 shadow-lg animate-in fade-in">
							<Check className="w-3 h-3 text-[#00e5ff]" />
							<span>{isCopyrightFreeActive ? "Playing Copyright-Free Preview!" : "Live Preview Updated!"}</span>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Player Toolbar: Timecodes, Play Button, Aspect Ratio */}
			<div className="h-8 bg-[#18191c] border-t border-[#212328] px-3 flex items-center justify-between text-slate-400 shrink-0">
				{/* Left Timecode */}
				<div className="flex items-center gap-1.5 font-mono text-[11px]">
					<span className="text-[#00e5ff] font-semibold">
						{formatCapCutTimecode(currentTime)}
					</span>
					<span className="text-slate-400 font-medium">
						{formatCapCutTimecode(duration)}
					</span>
				</div>

				{/* Center Play/Pause Controls */}
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={togglePlay}
						className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-transform hover:scale-105 shadow cursor-pointer"
						title={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? (
							<Pause className="w-3.5 h-3.5 fill-black" />
						) : (
							<Play className="w-3.5 h-3.5 fill-black ml-0.5" />
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
							<option value="9:16">9:16 (Shorts)</option>
							<option value="16:9">16:9 (Landscape)</option>
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
