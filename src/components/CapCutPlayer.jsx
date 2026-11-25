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
	Check,
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
}) {
	const videoRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [previewToast, setPreviewToast] = useState(false);

	useEffect(() => {
		if (videoRef.current && seekTime !== null) {
			videoRef.current.currentTime = seekTime;
		}
	}, [seekTime]);

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
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
			videoRef.current.play();
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
			{/* Top Bar: Player Title + 👁️ Update Live Preview Button */}
			<div className="h-9 bg-[#141518] border-b border-[#212328] px-3 flex items-center justify-between text-slate-400">
				<span className="font-semibold text-slate-300 flex items-center gap-1.5">
					<Film className="w-3.5 h-3.5 text-[#00e5ff]" />
					Player Canvas
				</span>

				{/* The Requested Live Preview Button */}
				<button
					type="button"
					onClick={triggerLivePreview}
					className="px-2.5 py-1 bg-[#1f2025] hover:bg-[#2b2d35] text-[#00e5ff] border border-[#00e5ff]/50 rounded text-[11px] font-bold flex items-center gap-1.5 shadow transition-colors"
					title="Preview with all selected effects and muted audio"
				>
					<Eye className="w-3 h-3 text-[#00e5ff]" />
					<span>👁️ Update Live Preview</span>
				</button>
			</div>

			{/* Center Viewport: Filling the space without large empty black gaps */}
			<div className="flex-1 relative flex items-center justify-center p-2 bg-[#0c0d10] overflow-hidden">
				<div
					className={`relative bg-black flex items-center justify-center shadow-2xl transition-all duration-150 border border-[#232429] ${
						aspectRatio === "9:16"
							? "h-full max-h-[380px] aspect-[9/16]"
							: "w-full max-w-[620px] aspect-[16/9]"
					}`}
				>
					{/* The Solid Black Base Layer (black.jpg) */}
					{blackBgLayer && (
						<div className="absolute inset-0 bg-black z-0 pointer-events-none" />
					)}

					{videoUrl ? (
						<video
							ref={videoRef}
							src={videoUrl}
							muted={muteOriginalAudio}
							className="relative z-10 w-full h-full object-contain"
							style={{
								transform: `${mirror ? "scaleX(-1)" : ""} scale(${
									blackBgLayer ? scaleRatio : 1
								}) ${applyZoom ? "scale(1.02)" : ""}`,
								transformOrigin: "center top",
								filter: liveFilter,
							}}
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
								Import a video from media panel to preview
							</p>
						</div>
					)}

					{/* Text Overlay (Hook / Captions) */}
					{showTextOverlay && textOverlay && (
						<div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1 bg-black/80 rounded border-2 border-yellow-400 text-yellow-300 font-extrabold text-xs sm:text-sm tracking-wide text-center uppercase shadow-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[90%]">
							{textOverlay}
						</div>
					)}

					{/* Sticker Overlay (Reaction Meme) */}
					{showStickerOverlay && stickerOverlay && (
						<div className="absolute bottom-12 right-4 z-20 pointer-events-none text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce">
							{stickerOverlay}
						</div>
					)}

					{/* Live Preview Toast Notification */}
					{previewToast && (
						<div className="absolute top-3 bg-black/90 text-[#00e5ff] border border-[#00e5ff]/50 px-3 py-1 rounded-full text-[10px] font-bold z-30 flex items-center gap-1.5 shadow-lg animate-in fade-in">
							<Check className="w-3 h-3 text-[#00e5ff]" />
							<span>Live Preview Updated!</span>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Player Toolbar: Timecodes, Play Button, Aspect Ratio */}
			<div className="h-8 bg-[#18191c] border-t border-[#212328] px-3 flex items-center justify-between text-slate-400">
				{/* Left Timecode */}
				<div className="flex items-center gap-1.5 font-mono text-[11px]">
					<span className="text-[#00e5ff] font-semibold">
						{formatCapCutTimecode(currentTime)}
					</span>
					<span className="text-slate-400 font-medium">
						{formatCapCutTimecode(duration)}
					</span>
				</div>

				{/* Center: Play / Pause */}
				<button
					type="button"
					onClick={togglePlay}
					disabled={!videoUrl}
					className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-colors shadow"
				>
					{isPlaying ? (
						<Pause className="w-3 h-3 fill-current" />
					) : (
						<Play className="w-3 h-3 fill-current ml-0.5" />
					)}
				</button>

				{/* Right: Aspect Ratio Selector & Fullscreen */}
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 bg-[#222329] px-2 py-0.5 rounded border border-[#2b2d35] text-[10px] text-slate-200 cursor-pointer">
						<select
							value={aspectRatio}
							onChange={(e) => setAspectRatio(e.target.value)}
							className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
						>
							<option value="9:16">9:16 (Shorts)</option>
							<option value="16:9">16:9 (Long)</option>
						</select>
					</div>

					<button
						type="button"
						className="p-1 rounded hover:bg-[#202126] text-slate-400 hover:text-white"
					>
						<Maximize2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
