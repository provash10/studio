"use client";

import React, { useState, useEffect } from "react";
import {
	Folder,
	Music,
	Type,
	Star,
	Sparkles,
	SlidersHorizontal,
	Plus,
	Grid,
	Film,
	Square,
	Scissors,
	CheckSquare,
	Layers,
	ChevronDown,
	ChevronRight,
	Upload,
	Check,
	Volume2,
	VolumeX,
	Play,
	Pause,
	Wand2,
	Palette,
	FlipHorizontal,
	ZoomIn,
	RotateCcw,
	Smile,
	Flame,
	Bell,
} from "lucide-react";

export default function CapCutMediaLibrary({
	onFileUpload,
	onLoadSample,
	uploadedVideo,
	videoTitle,
	duration,
	isUploading = false,
	// Mode Switcher Props
	editMode = "auto",
	setEditMode,
	// Left Side Editing Checklist props
	blackBgLayer,
	setBlackBgLayer,
	videoScale = 94,
	setVideoScale,
	overlayChroma = true,
	setOverlayChroma,
	autoTrim40s = false,
	setAutoTrim40s,
	trimStart = 0,
	setTrimStart,
	trimEnd = 40,
	setTrimEnd,
	// Active Top Tab
	activeTopTab = "media",
	setActiveTopTab,
	// Video Creation Props
	onCreateVideo,
	isCreatingVideo = false,
	processedVideoUrl = null,
	// Audio Props
	bgmEnabled,
	setBgmEnabled,
	bgmTrackName,
	setBgmTrackName,
	bgmVolume,
	setBgmVolume,
	muteOriginalAudio,
	setMuteOriginalAudio,
	// Text & Sticker Overlays
	textOverlay,
	setTextOverlay,
	showTextOverlay,
	setShowTextOverlay,
	stickerOverlay,
	setStickerOverlay,
	showStickerOverlay,
	setShowStickerOverlay,
	// Effects & Transitions
	applyZoom,
	setApplyZoom,
	mirror,
	setMirror,
	activeTransition,
	setActiveTransition,
	// Filters & Adjustments
	colorFilter,
	setColorFilter,
	brightness,
	setBrightness,
	contrast,
	setContrast,
	saturation,
	setSaturation,
}) {
	const [activeSubTab, setActiveSubTab] = useState("media"); // 'media' or 'checklist'
	const [playingAudioPreview, setPlayingAudioPreview] = useState(null);

	// Automatically sync tab with editMode
	useEffect(() => {
		if (editMode === "auto") {
			setActiveSubTab("media");
		} else if (editMode === "manual") {
			setActiveSubTab("checklist");
		}
	}, [editMode]);

	const topTools = [
		{ id: "media", label: "Media", icon: Folder },
		{ id: "audio", label: "Audio", icon: Music },
		{ id: "text", label: "Text", icon: Type },
		{ id: "stickers", label: "Stickers", icon: Star },
		{ id: "effects", label: "Effects", icon: Sparkles },
		{
			id: "transitions",
			label: "Transitions",
			icon: () => (
				<span className="text-[11px] font-bold tracking-tighter">⧖</span>
			),
		},
		{
			id: "filters",
			label: "Filters",
			icon: () => (
				<span className="text-[11px] font-bold tracking-tighter">◯◯</span>
			),
		},
		{ id: "adjustment", label: "Adjustment", icon: SlidersHorizontal },
	];

	// BGM Tracks list
	const bgmTracks = [
		{ id: "bg1.mp4", name: "bg1.mp4", mood: "Chill Beat", bpm: "95 BPM" },
		{ id: "bg2.mp4", name: "bg2.mp4", mood: "Dramatic Hook", bpm: "110 BPM" },
		{ id: "bg3.mp4", name: "bg3.mp4", mood: "Upbeat Viral", bpm: "128 BPM" },
		{ id: "bg4.mp4", name: "bg4.mp4", mood: "Cinematic Atmosphere", bpm: "85 BPM" },
	];

	// Text Presets
	const textPresets = [
		"WAIT FOR IT... 🔥",
		"WATCH TILL THE END 😱",
		"100% UNBELIEVABLE 🤯",
		"DON'T BLINK ⚡",
		"PART 1 / 2 🎬",
		"BEST MOMENT EVER 😂",
	];

	// Stickers list
	const stickers = [
		{ id: "🧸", label: "Puppet", subtitle: "2.mp4 meme" },
		{ id: "🏃", label: "Runner", subtitle: "3.mp4 meme" },
		{ id: "💀", label: "Skeleton", subtitle: "4.mp4 meme" },
		{ id: "🔔", label: "Subscribe", subtitle: "Click badge" },
		{ id: "🔥", label: "Fire Streak", subtitle: "Viral badge" },
		{ id: "😱", label: "Shock Face", subtitle: "Climax hook" },
	];

	// Filter presets
	const filterList = [
		{ id: "none", name: "Natural (Raw)", color: "from-slate-700 to-slate-900" },
		{ id: "cinematic", name: "Teal & Orange", color: "from-cyan-700 to-amber-700" },
		{ id: "warm", name: "Golden Sunset", color: "from-amber-600 to-rose-700" },
		{ id: "cool", name: "Nordic Frost", color: "from-blue-600 to-cyan-800" },
		{ id: "vivid", name: "Hyper Pop", color: "from-fuchsia-600 to-purple-800" },
		{ id: "mono", name: "Film Noir", color: "from-zinc-400 to-zinc-900" },
	];

	// Transitions list
	const transitions = [
		{ id: "fade", name: "Fade Black", icon: "⬛", desc: "Classic YouTube dark dip" },
		{ id: "crossfade", name: "Cross Dissolve", icon: "🌫️", desc: "Smooth scene blend" },
		{ id: "whip", name: "Whip Zoom", icon: "💨", desc: "High energy fast cut" },
		{ id: "flash", name: "Flash White", icon: "⚡", desc: "Climax scene reveal" },
	];

	return (
		<div className="h-full flex flex-col bg-[#141518] border-r border-[#212328] select-none text-xs overflow-hidden">
			{/* Top Tool Shelf (Authentic 8 CapCut buttons - now all fully interactive!) */}
			<div className="h-11 bg-[#141518] border-b border-[#212328] px-1 flex items-center justify-between no-scrollbar shrink-0">
				{topTools.map((tool) => {
					const Icon = tool.icon;
					const isActive = activeTopTab === tool.id;
					return (
						<button
							key={tool.id}
							type="button"
							onClick={() => setActiveTopTab(tool.id)}
							className={`flex-1 flex flex-col items-center justify-center py-1 rounded transition-colors group cursor-pointer ${
								isActive
									? "text-[#00e5ff]"
									: "text-slate-400 hover:text-slate-200"
							}`}
							title={tool.label}
						>
							<div className="w-4 h-4 flex items-center justify-center">
								{typeof Icon === "function" ? (
									<Icon />
								) : (
									<Icon className="w-3.5 h-3.5" />
								)}
							</div>
							<span className="text-[9.5px] font-medium leading-none mt-1 truncate max-w-full">
								{tool.label}
							</span>
							{isActive && (
								<div className="w-3 h-0.5 bg-[#00e5ff] rounded-full mt-0.5" />
							)}
						</button>
					);
				})}
			</div>

			{/* TAB CONTENT ROUTER: ALL 8 TABS ARE FULLY FUNCTIONAL */}

			{/* 1. MEDIA TAB */}
			{activeTopTab === "media" && (
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Sub-Tabs: Media Files vs Left Editing Checklist */}
					<div className="h-9 bg-[#17181c] border-b border-[#212328] px-2.5 flex items-center justify-between shrink-0">
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => setActiveSubTab("media")}
								className={`px-3 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
									activeSubTab === "media"
										? "bg-[#25272e] text-white shadow-sm"
										: "text-slate-400 hover:text-white"
								}`}
							>
								<Folder className="w-3 h-3 text-[#00e5ff]" />
								<span>Media Files</span>
							</button>

							<button
								type="button"
								onClick={() => setActiveSubTab("checklist")}
								className={`px-3 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
									activeSubTab === "checklist"
										? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 shadow-sm"
										: "text-slate-400 hover:text-white"
								}`}
							>
								<CheckSquare className="w-3 h-3" />
								<span>Left Editing Checklist</span>
								<span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
							</button>
						</div>

						<button
							type="button"
							onClick={onLoadSample}
							className="px-2 py-0.5 bg-[#202126] hover:bg-[#2b2d35] text-slate-300 rounded text-[10px] border border-[#2b2d35] transition-colors cursor-pointer"
							title="Load built-in rustic wooden test sample"
						>
							Sample
						</button>
					</div>

					<div className="flex-1 flex overflow-hidden">
						{activeSubTab === "media" ? (
							/* MEDIA ASSETS VIEW */
							<div className="flex-1 flex overflow-hidden">
								<div className="w-16 border-r border-[#212328] bg-[#121316] p-1.5 flex flex-col gap-1 text-[10px] text-slate-400 shrink-0">
									<div className="flex items-center justify-between px-1 py-1 text-slate-300 font-semibold text-[10px]">
										<span>Local</span>
										<ChevronDown className="w-2.5 h-2.5" />
									</div>
									<div className="px-2 py-1 rounded bg-[#202227] text-[#00e5ff] font-medium flex items-center gap-1">
										<ChevronRight className="w-2.5 h-2.5" />
										<span>Import</span>
									</div>
									<div className="px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-[#1a1b20] cursor-pointer">
										Library
									</div>
								</div>

								<div className="flex-1 flex flex-col p-2.5 bg-[#141518] overflow-hidden">
									<div className="flex items-center justify-between pb-2 border-b border-[#212328] gap-2 shrink-0">
										<label className="cursor-pointer bg-[#1f2127] hover:bg-[#282a32] text-slate-200 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-[#2f323c] flex items-center gap-1.5 transition-all shadow-sm">
											<span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] text-black flex items-center justify-center font-bold text-[10px]">
												+
											</span>
											<span>{isUploading ? "Importing..." : "Import"}</span>
											<input
												type="file"
												accept="video/*"
												className="hidden"
												onChange={(e) => onFileUpload(e.target.files?.[0])}
											/>
										</label>

										<div className="flex items-center gap-2 text-slate-400 text-[10px]">
											<Grid className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-white" />
											<div className="flex items-center gap-0.5 cursor-pointer hover:text-white">
												<span>Sort</span>
												<ChevronDown className="w-2.5 h-2.5" />
											</div>
										</div>
									</div>

									<div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1 pt-2 content-start">
										{uploadedVideo ? (
											<div className="relative rounded-md overflow-hidden bg-[#1c1d22] border border-[#00e5ff]/60 aspect-[4/3] flex flex-col justify-between p-1.5 group cursor-pointer shadow-md">
												<div className="flex items-center justify-between z-10">
													<span className="bg-[#00e5ff] text-black text-[9px] font-bold px-1.5 py-0.2 rounded">
														Added
													</span>
													<span className="text-[9px] text-slate-300 font-mono bg-black/70 px-1 rounded">
														00:{Math.floor(duration || 36).toString().padStart(2, "0")}
													</span>
												</div>
												<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2930] to-[#12161a]">
													<Film className="w-8 h-8 text-[#00e5ff]" />
												</div>
												<div className="z-10 bg-black/85 px-1.5 py-0.5 rounded text-[9.5px] text-slate-200 truncate font-mono">
													{videoTitle || "Uploaded Video"}
												</div>
											</div>
										) : (
											<label className="col-span-2 cursor-pointer border-2 border-dashed border-[#2f323c] hover:border-[#00e5ff]/50 rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center bg-[#17181c] transition-colors">
												<Film className="w-8 h-8 text-slate-500" />
												<span className="text-slate-300 font-bold text-xs">ভিডিও আপলোড করতে এখানে ক্লিক করুন</span>
												<span className="text-[10px] text-slate-500">MP4, MOV, WebM ফাইল সাপোর্ট করে</span>
												<input
													type="file"
													accept="video/*"
													onChange={(e) => {
														const f = e.target.files?.[0];
														if (f && onFileUpload) onFileUpload(f);
													}}
													className="hidden"
												/>
											</label>
										)}

										{processedVideoUrl && (
											<div className="relative rounded-md overflow-hidden bg-[#0d1f16] border border-emerald-500/60 aspect-[4/3] flex flex-col justify-between p-1.5 group cursor-pointer shadow-md">
												<div className="flex items-center justify-between z-10">
													<span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded">
														✓ Rendered
													</span>
													<span className="text-[9px] text-emerald-300 font-mono bg-black/70 px-1 rounded">
														00:{Math.floor(duration || 36).toString().padStart(2, "0")}
													</span>
												</div>
												<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#102a1e] to-[#0d1612]">
													<Sparkles className="w-8 h-8 text-emerald-400" />
												</div>
												<div className="z-10 bg-black/85 px-1.5 py-0.5 rounded text-[9.5px] text-emerald-300 truncate font-mono">
													Copyright-Free Output
												</div>
											</div>
										)}
									</div>

									{/* Action Button: Create Copyright-Free Video */}
									<div className="pt-2 border-t border-[#212328] flex flex-col gap-1 shrink-0">
										<button
											type="button"
											onClick={onCreateVideo}
											disabled={isCreatingVideo || !uploadedVideo}
											className={`w-full py-2 rounded-md font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
												isCreatingVideo
													? "bg-[#25262c] text-slate-400 cursor-not-allowed border border-[#30323a]"
													: processedVideoUrl
													? "bg-[#0c1417] text-[#00e5ff] border border-[#00e5ff]/70 hover:bg-[#121c21]"
													: "bg-[#00e5ff] text-black hover:bg-[#00cbe2]"
											}`}
										>
											<Sparkles className="w-3.5 h-3.5" />
											<span>
												{isCreatingVideo
													? "Creating Video..."
													: processedVideoUrl
													? "Re-Create Video"
													: "⚡ Create Copyright-Free Video"}
											</span>
										</button>
									</div>
								</div>
							</div>
						) : (
							/* LEFT EDITING CHECKLIST (Auto Mode vs Manual Mode) */
							<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-slate-300">
								<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
									<span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
										<Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
										Left Video Editing Checklist
									</span>
									<span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
										editMode === "auto"
											? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
											: "bg-[#00e5ff]/10 text-[#00e5ff]"
									}`}>
										{editMode === "auto" ? "Auto: All OK" : "Manual Mode"}
									</span>
								</div>

								{/* AUTO MODE: ALL OK VIEW (No slider clutter, 1-click ready) */}
								{editMode === "auto" ? (
									<div className="flex flex-col gap-3">
										<div className="p-3 bg-[#0a1612] border border-emerald-500/40 rounded-lg flex flex-col gap-2.5">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-[11px]">
													<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
													<span>Auto Mode: All 4 Visual Layers OK</span>
												</div>
												<span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-bold">
													Ready
												</span>
											</div>
											<p className="text-[9.5px] text-slate-300 leading-snug">
												All 4 visual layers are automatically locked with the official VideoForge anti-copyright settings. Just upload and click &ldquo;⚡ Create Video&rdquo;!
											</p>
											<div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-emerald-300 font-medium">
												<div className="flex items-center gap-1 bg-[#12231b] p-1.5 rounded border border-emerald-500/30">
													<Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
													<span>black.jpg Base Layer</span>
												</div>
												<div className="flex items-center gap-1 bg-[#12231b] p-1.5 rounded border border-emerald-500/30">
													<Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
													<span>94% Centered Scale</span>
												</div>
												<div className="flex items-center gap-1 bg-[#12231b] p-1.5 rounded border border-emerald-500/30">
													<Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
													<span>Chroma Meme (V3)</span>
												</div>
												<div className="flex items-center gap-1 bg-[#12231b] p-1.5 rounded border border-emerald-500/30">
													<Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
													<span>40s Climax Hook</span>
												</div>
											</div>
										</div>

										<button
											type="button"
											onClick={() => setEditMode && setEditMode("manual")}
											className="py-2 px-3 bg-[#18191c] hover:bg-[#202227] text-[#00e5ff] border border-[#00e5ff]/50 rounded text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
										>
											<SlidersHorizontal className="w-3.5 h-3.5" />
											<span>Switch to Manual to Show All Sliders &amp; Checkboxes</span>
										</button>
									</div>
								) : (
									/* MANUAL MODE: SHOW ALL DETAILED CHECKLIST CARDS & SLIDERS */
									<>
										{/* Item 1: Solid Black Canvas Base */}
										<div className={`p-2.5 rounded-lg border transition-all ${blackBgLayer ? "bg-[#0c1417] border-[#00e5ff]/60 text-white" : "bg-[#18191c] border-[#26282f] text-slate-400"}`}>
											<label className="flex items-start justify-between cursor-pointer gap-2">
												<div>
													<div className="text-[11px] font-bold text-white flex items-center gap-1">
														<span>1. Solid Black Base Canvas</span>
														{blackBgLayer && <span className="text-[9px] text-[#00e5ff] font-mono">[black.jpg]</span>}
													</div>
													<p className="text-[9px] text-slate-400 mt-0.5">Adds solid black base layer beneath video to defeat YouTube frame matching.</p>
												</div>
												<input type="checkbox" checked={blackBgLayer} onChange={(e) => setBlackBgLayer(e.target.checked)} className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5" />
											</label>
										</div>

										{/* Item 2: Video Scaling */}
										<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
											<label className="flex items-start justify-between cursor-pointer gap-2">
												<div>
													<div className="text-[11px] font-bold text-white">2. Video Scale & Centering</div>
													<p className="text-[9px] text-slate-400 mt-0.5">Scales video slightly so black border surrounds the frame.</p>
												</div>
												<input type="checkbox" checked={videoScale < 100} onChange={(e) => setVideoScale(e.target.checked ? 94 : 100)} className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5" />
											</label>
											<div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#212328]">
												<span className="text-slate-400">Manual Scale:</span>
												<div className="flex items-center gap-2">
													<input type="range" min={85} max={100} value={videoScale} onChange={(e) => setVideoScale(Number(e.target.value))} className="accent-[#00e5ff] w-20 h-1 bg-[#25262c] rounded cursor-pointer" />
													<span className="font-mono text-[#00e5ff] w-7 text-right font-bold">{videoScale}%</span>
												</div>
											</div>
										</div>

										{/* Item 3: Green Screen Overlay */}
										<div className={`p-2.5 rounded-lg border transition-all ${overlayChroma ? "bg-[#0b1a10] border-emerald-500/60" : "bg-[#18191c] border-[#26282f]"}`}>
											<label className="flex items-start justify-between cursor-pointer gap-2">
												<div>
													<div className="text-[11px] font-bold text-white flex items-center gap-1">
														<span>3. Green Screen Meme Overlay (V3)</span>
														<span className="text-[9px] text-emerald-400 font-mono">[Chroma]</span>
													</div>
													<p className="text-[9px] text-slate-400 mt-0.5">Superimposes reaction meme characters on top track.</p>
												</div>
												<input type="checkbox" checked={overlayChroma} onChange={(e) => setOverlayChroma(e.target.checked)} className="accent-emerald-400 w-4 h-4 cursor-pointer mt-0.5" />
											</label>
										</div>

										{/* Item 4: Highlight Trimmer */}
										<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
											<label className="flex items-start justify-between cursor-pointer gap-2">
												<div>
													<div className="text-[11px] font-bold text-white flex items-center gap-1">
														<Scissors className="w-3 h-3 text-amber-400" />
														<span>4. CapCut Highlight Trimmer</span>
													</div>
													<p className="text-[9px] text-slate-400 mt-0.5">Trims video to first 40s viral climax hook as per Docs.</p>
												</div>
												<input type="checkbox" checked={autoTrim40s} onChange={(e) => setAutoTrim40s(e.target.checked)} className="accent-amber-400 w-4 h-4 cursor-pointer mt-0.5" />
											</label>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{/* 2. AUDIO TAB */}
			{activeTopTab === "audio" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<Music className="w-3.5 h-3.5 text-[#00e5ff]" />
							Audio & Background Music
						</span>
						<span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
							Zero Match
						</span>
					</div>

					{/* 100% Original Mute Toggle */}
					<div className="p-2.5 rounded-lg border bg-[#180a0d] border-rose-500/50 flex items-center justify-between">
						<div>
							<div className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
								<VolumeX className="w-3.5 h-3.5 text-rose-400" />
								<span>Mute Original Video Sound (100%)</span>
							</div>
							<p className="text-[9px] text-slate-400 mt-0.5">Eliminates original audio completely to defeat acoustic fingerprinting.</p>
						</div>
						<input
							type="checkbox"
							checked={muteOriginalAudio}
							onChange={(e) => setMuteOriginalAudio(e.target.checked)}
							className="accent-rose-500 w-4 h-4 cursor-pointer"
						/>
					</div>

					{/* BGM Track Selector & Preview */}
					<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold text-white">Copyright-Free BGM Tracks</span>
							<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
								<span>Enable BGM:</span>
								<input
									type="checkbox"
									checked={bgmEnabled}
									onChange={(e) => setBgmEnabled(e.target.checked)}
									className="accent-[#00e5ff] w-3.5 h-3.5 cursor-pointer"
								/>
							</label>
						</div>

						<div className="flex flex-col gap-1.5 pt-1">
							{bgmTracks.map((track) => (
								<div
									key={track.id}
									onClick={() => setBgmTrackName(track.id)}
									className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
										bgmTrackName === track.id
											? "bg-[#0c1417] border-[#00e5ff]/70 text-white"
											: "bg-[#141518] border-[#212328] text-slate-400 hover:text-slate-200"
									}`}
								>
									<div className="flex items-center gap-2">
										<span className={`w-2 h-2 rounded-full ${bgmTrackName === track.id ? "bg-[#00e5ff]" : "bg-slate-600"}`} />
										<div>
											<div className="text-[10.5px] font-bold font-mono">{track.name}</div>
											<div className="text-[9px] text-slate-500">{track.mood} • {track.bpm}</div>
										</div>
									</div>
									{bgmTrackName === track.id && (
										<span className="text-[9px] text-[#00e5ff] font-bold bg-[#00e5ff]/10 px-1.5 py-0.5 rounded">
											Active
										</span>
									)}
								</div>
							))}
						</div>

						{/* BGM Volume Slider */}
						<div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#212328]">
							<span className="text-slate-400">BGM Volume:</span>
							<div className="flex items-center gap-2">
								<input
									type="range"
									min={0.05}
									max={0.5}
									step={0.05}
									value={bgmVolume}
									onChange={(e) => setBgmVolume(Number(e.target.value))}
									className="accent-[#00e5ff] w-24 h-1 bg-[#25262c] rounded cursor-pointer"
								/>
								<span className="font-mono text-[#00e5ff] font-bold">{Math.round(bgmVolume * 100)}%</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 3. TEXT TAB */}
			{activeTopTab === "text" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<Type className="w-3.5 h-3.5 text-[#00e5ff]" />
							Text Overlays & Captions
						</span>
						<label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
							<span>Show on Video:</span>
							<input
								type="checkbox"
								checked={showTextOverlay}
								onChange={(e) => setShowTextOverlay(e.target.checked)}
								className="accent-[#00e5ff] w-3.5 h-3.5"
							/>
						</label>
					</div>

					{/* Custom Text Input */}
					<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
						<span className="text-[10.5px] font-bold text-white">Custom Banner Text</span>
						<input
							type="text"
							value={textOverlay}
							onChange={(e) => {
								setTextOverlay(e.target.value);
								setShowTextOverlay(true);
							}}
							placeholder="Type overlay text here..."
							className="w-full bg-[#121316] border border-[#2b2d35] rounded p-2 text-white text-[11px] focus:outline-none focus:border-[#00e5ff] font-bold"
						/>
					</div>

					{/* 1-Click Viral Hook Presets */}
					<div className="flex flex-col gap-2">
						<span className="text-[10.5px] font-bold text-slate-300">Viral Hook Presets (1-Click)</span>
						<div className="grid grid-cols-2 gap-2">
							{textPresets.map((preset) => (
								<button
									key={preset}
									type="button"
									onClick={() => {
										setTextOverlay(preset);
										setShowTextOverlay(true);
									}}
									className={`p-2 rounded border text-[10px] font-bold text-left transition-all cursor-pointer ${
										textOverlay === preset && showTextOverlay
											? "bg-[#0c1417] border-[#00e5ff] text-yellow-300"
											: "bg-[#18191c] border-[#26282f] text-slate-300 hover:text-white hover:border-slate-500"
									}`}
								>
									{preset}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* 4. STICKERS TAB */}
			{activeTopTab === "stickers" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<Star className="w-3.5 h-3.5 text-[#00e5ff]" />
							Animated Stickers & Reaction Memes
						</span>
						<label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
							<span>Active:</span>
							<input
								type="checkbox"
								checked={showStickerOverlay}
								onChange={(e) => setShowStickerOverlay(e.target.checked)}
								className="accent-[#00e5ff] w-3.5 h-3.5"
							/>
						</label>
					</div>

					<p className="text-[9.5px] text-slate-400">
						Click any sticker to instantly superimpose it over the live video preview.
					</p>

					<div className="grid grid-cols-2 gap-2.5">
						{stickers.map((s) => (
							<button
								key={s.id}
								type="button"
								onClick={() => {
									setStickerOverlay(s.id);
									setShowStickerOverlay(true);
								}}
								className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
									stickerOverlay === s.id && showStickerOverlay
										? "bg-[#0c1417] border-[#00e5ff] text-white shadow-md shadow-cyan-950"
										: "bg-[#18191c] border-[#26282f] text-slate-300 hover:border-slate-500"
								}`}
							>
								<span className="text-2xl">{s.id}</span>
								<div className="text-left">
									<div className="text-[11px] font-bold">{s.label}</div>
									<div className="text-[9px] text-slate-500">{s.subtitle}</div>
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* 5. EFFECTS TAB */}
			{activeTopTab === "effects" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
							Anti-Bot Visual Effects
						</span>
						<span className="text-[9px] text-[#00e5ff] font-mono">Live In Player</span>
					</div>

					{/* Effect 1: Mirror Flip */}
					<div className={`p-2.5 rounded-lg border transition-all ${mirror ? "bg-[#0c1417] border-[#00e5ff]" : "bg-[#18191c] border-[#26282f]"}`}>
						<label className="flex items-start justify-between cursor-pointer">
							<div>
								<div className="text-[11px] font-bold text-white flex items-center gap-1.5">
									<FlipHorizontal className="w-3.5 h-3.5 text-[#00e5ff]" />
									<span>Horizontal Flip (Mirror)</span>
								</div>
								<p className="text-[9px] text-slate-400 mt-0.5">Mirrors frame horizontally to break digital pattern matching.</p>
							</div>
							<input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5" />
						</label>
					</div>

					{/* Effect 2: Safe Zoom */}
					<div className={`p-2.5 rounded-lg border transition-all ${applyZoom ? "bg-[#150f1f] border-purple-500" : "bg-[#18191c] border-[#26282f]"}`}>
						<label className="flex items-start justify-between cursor-pointer">
							<div>
								<div className="text-[11px] font-bold text-white flex items-center gap-1.5">
									<ZoomIn className="w-3.5 h-3.5 text-purple-400" />
									<span>Safe 2% Top-Anchor Zoom</span>
								</div>
								<p className="text-[9px] text-slate-400 mt-0.5">1.02x zoom with top anchor; protects caps, heads, and clocks.</p>
							</div>
							<input type="checkbox" checked={applyZoom} onChange={(e) => setApplyZoom(e.target.checked)} className="accent-purple-500 w-4 h-4 cursor-pointer mt-0.5" />
						</label>
					</div>

					{/* Effect 3: Solid Black Canvas Base */}
					<div className={`p-2.5 rounded-lg border transition-all ${blackBgLayer ? "bg-[#0c1417] border-[#00e5ff]" : "bg-[#18191c] border-[#26282f]"}`}>
						<label className="flex items-start justify-between cursor-pointer">
							<div>
								<div className="text-[11px] font-bold text-white flex items-center gap-1.5">
									<Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
									<span>Solid Black Under-Layer (black.jpg)</span>
								</div>
								<p className="text-[9px] text-slate-400 mt-0.5">Underneath video with 94% scale to prevent edge matching.</p>
							</div>
							<input type="checkbox" checked={blackBgLayer} onChange={(e) => setBlackBgLayer(e.target.checked)} className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5" />
						</label>
					</div>
				</div>
			)}

			{/* 6. TRANSITIONS TAB */}
			{activeTopTab === "transitions" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<span className="text-[11px]">⧖</span>
							Scene Cut Transitions
						</span>
						<span className="text-[9px] text-slate-400 font-mono">Split Points</span>
					</div>

					<p className="text-[9.5px] text-slate-400">
						Select transition applied at clip split and cut boundaries:
					</p>

					<div className="flex flex-col gap-2">
						{transitions.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setActiveTransition(t.id)}
								className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
									activeTransition === t.id
										? "bg-[#0c1417] border-[#00e5ff] text-white"
										: "bg-[#18191c] border-[#26282f] text-slate-300 hover:border-slate-500"
								}`}
							>
								<div className="flex items-center gap-2">
									<span className="text-base">{t.icon}</span>
									<div className="text-left">
										<div className="text-[11px] font-bold">{t.name}</div>
										<div className="text-[9px] text-slate-500">{t.desc}</div>
									</div>
								</div>
								{activeTransition === t.id && (
									<span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
								)}
							</button>
						))}
					</div>
				</div>
			)}

			{/* 7. FILTERS TAB */}
			{activeTopTab === "filters" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<Palette className="w-3.5 h-3.5 text-[#00e5ff]" />
							1-Click Color Grading Filters
						</span>
						<span className="text-[9px] text-[#00e5ff] font-mono">Live in Player</span>
					</div>

					<p className="text-[9.5px] text-slate-400">
						Clicking any filter instantly shifts the color histogram in both the live player and export:
					</p>

					<div className="grid grid-cols-2 gap-2.5">
						{filterList.map((f) => (
							<button
								key={f.id}
								type="button"
								onClick={() => setColorFilter(f.id)}
								className={`rounded-lg border overflow-hidden flex flex-col cursor-pointer transition-all ${
									colorFilter === f.id
										? "border-[#00e5ff] shadow-md shadow-cyan-950 scale-[1.02]"
										: "border-[#26282f] hover:border-slate-500 opacity-80 hover:opacity-100"
								}`}
							>
								<div className={`h-12 w-full bg-gradient-to-tr ${f.color} flex items-center justify-center`}>
									{colorFilter === f.id && (
										<span className="bg-black/60 text-[#00e5ff] px-2 py-0.5 rounded text-[9px] font-bold border border-[#00e5ff]/50">
											✓ Active
										</span>
									)}
								</div>
								<div className="p-2 bg-[#18191c] text-left">
									<div className="text-[11px] font-bold text-white">{f.name}</div>
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* 8. ADJUSTMENT TAB */}
			{activeTopTab === "adjustment" && (
				<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
					<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
						<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
							<SlidersHorizontal className="w-3.5 h-3.5 text-[#00e5ff]" />
							Live Color & Geometry Adjustments
						</span>
						<button
							type="button"
							onClick={() => {
								setBrightness(0.03);
								setContrast(1.05);
								setSaturation(1.08);
								setVideoScale(94);
							}}
							className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
						>
							<RotateCcw className="w-2.5 h-2.5" />
							<span>Reset</span>
						</button>
					</div>

					<p className="text-[9.5px] text-slate-400">
						Move sliders to see changes happen live in the player canvas:
					</p>

					<div className="bg-[#18191c] border border-[#26282f] rounded-lg p-3 flex flex-col gap-3">
						{/* Brightness */}
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-300">Brightness</span>
								<span className="font-mono text-[#00e5ff] font-bold">{Math.round(brightness * 100)}%</span>
							</div>
							<input
								type="range"
								min={-0.15}
								max={0.2}
								step={0.01}
								value={brightness}
								onChange={(e) => setBrightness(Number(e.target.value))}
								className="w-full accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
							/>
						</div>

						{/* Contrast */}
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-300">Contrast</span>
								<span className="font-mono text-[#00e5ff] font-bold">{Math.round(contrast * 100)}%</span>
							</div>
							<input
								type="range"
								min={0.8}
								max={1.4}
								step={0.02}
								value={contrast}
								onChange={(e) => setContrast(Number(e.target.value))}
								className="w-full accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
							/>
						</div>

						{/* Saturation */}
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-300">Saturation</span>
								<span className="font-mono text-[#00e5ff] font-bold">{Math.round(saturation * 100)}%</span>
							</div>
							<input
								type="range"
								min={0.7}
								max={1.5}
								step={0.02}
								value={saturation}
								onChange={(e) => setSaturation(Number(e.target.value))}
								className="w-full accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
							/>
						</div>

						{/* Scale */}
						<div className="flex flex-col gap-1 pt-2 border-t border-[#212328]">
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-300">Video Scale (Border)</span>
								<span className="font-mono text-[#00e5ff] font-bold">{videoScale}%</span>
							</div>
							<input
								type="range"
								min={85}
								max={100}
								value={videoScale}
								onChange={(e) => setVideoScale(Number(e.target.value))}
								className="w-full accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
