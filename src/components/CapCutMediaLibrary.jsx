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
	Save,
	Trash2,
	Move,
	BookmarkPlus,
	Headphones,
	FileAudio,
	Loader2,
} from "lucide-react";

export default function CapCutMediaLibrary({
	onFileUpload,
	onLoadSample,
	onDeleteVideo,
	onDeleteRendered,
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
	cliffhangerHook = { enabled: false, start: 40.5, end: 43.0, text: "WAIT FOR IT... 🔥" },
	setCliffhangerHook,
	// Active Top Tab
	activeTopTab = "media",
	setActiveTopTab,
	// Auto Captions Props
	autoCaption = { enabled: true, style: "viral_yellow", position: "bottom", scale: 1.0, segments: [] },
	setAutoCaption,
	onGenerateAutoCaptions,
	// Direct Voice Generation Props
	onGenerateVoice,
	isGeneratingVoice = false,
	voiceoverFileName = null,
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
	textPosition = { x: 50, y: 12 },
	setTextPosition,
	textScale = 1.0,
	setTextScale,
	stickerOverlay,
	setStickerOverlay,
	showStickerOverlay,
	setShowStickerOverlay,
	stickerPosition = { x: 85, y: 85 },
	setStickerPosition,
	stickerScale = 1.0,
	setStickerScale,
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
	const [savedCustomPresets, setSavedCustomPresets] = useState([]);
	const [presetSavedToast, setPresetSavedToast] = useState(false);

	// Load custom text presets from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("studio_custom_text_presets");
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed)) setSavedCustomPresets(parsed);
				}
			} catch (e) {
				console.warn("Could not load custom text presets:", e);
			}
		}
	}, []);

	const handleSaveCurrentText = () => {
		const trimmed = (textOverlay || "").trim();
		if (!trimmed) return;
		if (!savedCustomPresets.includes(trimmed)) {
			const updated = [trimmed, ...savedCustomPresets];
			setSavedCustomPresets(updated);
			if (typeof window !== "undefined") {
				localStorage.setItem("studio_custom_text_presets", JSON.stringify(updated));
			}
		}
		setPresetSavedToast(true);
		setTimeout(() => setPresetSavedToast(false), 2000);
	};

	const handleDeleteCustomPreset = (indexToDelete, e) => {
		if (e) e.stopPropagation();
		const updated = savedCustomPresets.filter((_, idx) => idx !== indexToDelete);
		setSavedCustomPresets(updated);
		if (typeof window !== "undefined") {
			localStorage.setItem("studio_custom_text_presets", JSON.stringify(updated));
		}
	};

	// --- Custom Audio States & Handlers ---
	const [savedCustomAudios, setSavedCustomAudios] = useState([]);
	const [isUploadingAudio, setIsUploadingAudio] = useState(false);
	const [audioSavedToast, setAudioSavedToast] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("studio_custom_audios");
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed)) setSavedCustomAudios(parsed);
				}
			} catch (e) {
				console.warn("Could not load custom audios:", e);
			}
		}
	}, []);

	const handleAudioFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setIsUploadingAudio(true);
		const formData = new FormData();
		formData.append("file", file);
		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (data.success && data.filename) {
				const newTrack = {
					id: data.filename,
					name: file.name,
					url: data.url,
					mood: "My Custom BGM",
					bpm: "Custom Audio",
				};
				const updated = [newTrack, ...savedCustomAudios];
				setSavedCustomAudios(updated);
				if (typeof window !== "undefined") {
					localStorage.setItem("studio_custom_audios", JSON.stringify(updated));
				}
				if (setBgmTrackName) setBgmTrackName(data.filename);
				if (setBgmEnabled) setBgmEnabled(true);
				setAudioSavedToast(true);
				setTimeout(() => setAudioSavedToast(false), 2000);
			}
		} catch (err) {
			alert("Audio upload failed: " + err.message);
		} finally {
			setIsUploadingAudio(false);
		}
	};

	const handleDeleteCustomAudio = (indexToDelete, e) => {
		if (e) e.stopPropagation();
		const updated = savedCustomAudios.filter((_, idx) => idx !== indexToDelete);
		setSavedCustomAudios(updated);
		if (typeof window !== "undefined") {
			localStorage.setItem("studio_custom_audios", JSON.stringify(updated));
		}
	};

	// --- Custom Sticker States & Handlers ---
	const [savedCustomStickers, setSavedCustomStickers] = useState([]);
	const [customStickerInput, setCustomStickerInput] = useState("🔥");
	const [customStickerLabel, setCustomStickerLabel] = useState("");
	const [stickerSavedToast, setStickerSavedToast] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("studio_custom_stickers");
				if (saved) {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed)) setSavedCustomStickers(parsed);
				}
			} catch (e) {
				console.warn("Could not load custom stickers:", e);
			}
		}
	}, []);

	const handleSaveCustomSticker = (emojiOverride) => {
		const emoji = (emojiOverride || customStickerInput || "").trim();
		if (!emoji) return;
		const label = (customStickerLabel || "").trim() || emoji;
		const newSticker = {
			id: emoji,
			label: label,
			subtitle: "My Custom Sticker",
		};
		const updated = [newSticker, ...savedCustomStickers.filter((s) => s.id !== emoji)];
		setSavedCustomStickers(updated);
		if (typeof window !== "undefined") {
			localStorage.setItem("studio_custom_stickers", JSON.stringify(updated));
		}
		if (setStickerOverlay) setStickerOverlay(emoji);
		if (setShowStickerOverlay) setShowStickerOverlay(true);
		setStickerSavedToast(true);
		setTimeout(() => setStickerSavedToast(false), 2000);
	};

	const handleDeleteCustomSticker = (indexToDelete, e) => {
		if (e) e.stopPropagation();
		const updated = savedCustomStickers.filter((_, idx) => idx !== indexToDelete);
		setSavedCustomStickers(updated);
		if (typeof window !== "undefined") {
			localStorage.setItem("studio_custom_stickers", JSON.stringify(updated));
		}
	};

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
										<div className="flex items-center gap-1.5">
											<label className="cursor-pointer bg-[#1f2127] hover:bg-[#282a32] text-slate-200 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-[#2f323c] flex items-center gap-1.5 transition-all shadow-sm">
												<span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] text-black flex items-center justify-center font-bold text-[10px]">
													+
												</span>
												<span>{isUploading ? "Importing..." : "Import"}</span>
												<input
													type="file"
													accept="video/*"
													className="hidden"
													onClick={(e) => { e.target.value = null; }}
													onChange={(e) => {
														const f = e.target.files?.[0];
														if (f && onFileUpload) {
															onFileUpload(f);
															e.target.value = "";
														}
													}}
												/>
											</label>

											{uploadedVideo && (
												<button
													type="button"
													onClick={onDeleteVideo}
													className="bg-[#261316] hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-900/60 hover:border-red-600 px-2 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
													title="বর্তমান ভিডিও মুছে ফেলুন (Delete Video & Reset)"
												>
													<Trash2 className="w-3 h-3 text-red-400" />
													<span>Delete</span>
												</button>
											)}
										</div>

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
											<>
												{/* 1. Uploaded / Active Video Card with Direct Delete & Replace */}
												<div className="relative rounded-md overflow-hidden bg-[#1c1d22] border border-[#00e5ff]/60 aspect-[4/3] flex flex-col justify-between p-1.5 group shadow-md transition-all hover:border-[#00e5ff]">
													<div className="flex items-center justify-between z-10">
														<span className="bg-[#00e5ff] text-black text-[9px] font-bold px-1.5 py-0.2 rounded">
															Added
														</span>
														<div className="flex items-center gap-1">
															<span className="text-[9px] text-slate-300 font-mono bg-black/70 px-1 rounded">
																00:{Math.floor(duration || 36).toString().padStart(2, "0")}
															</span>
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	if (onDeleteVideo) onDeleteVideo();
																}}
																className="p-1 bg-red-600/85 hover:bg-red-500 text-white rounded transition-colors shadow-sm cursor-pointer z-20"
																title="ভিডিওটি ডিলিট করুন (Delete / Remove Video)"
															>
																<Trash2 className="w-2.5 h-2.5" />
															</button>
														</div>
													</div>

													<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2930] to-[#12161a]">
														<Film className="w-8 h-8 text-[#00e5ff]" />
													</div>

													{/* Hover Action Overlay for Quick Replace or Delete */}
													<div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 z-10 p-2">
														<label className="w-full py-1 px-1.5 bg-[#00e5ff] hover:bg-[#33ebff] text-black text-[9.5px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all shadow">
															<Upload className="w-3 h-3" />
															<span>Replace Video</span>
															<input
																type="file"
																accept="video/*"
																onClick={(e) => { e.target.value = null; }}
																onChange={(e) => {
																	const f = e.target.files?.[0];
																	if (f && onFileUpload) {
																		onFileUpload(f);
																		e.target.value = "";
																	}
																}}
																className="hidden"
															/>
														</label>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																if (onDeleteVideo) onDeleteVideo();
															}}
															className="w-full py-1 px-1.5 bg-red-600/90 hover:bg-red-600 text-white text-[9.5px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
														>
															<Trash2 className="w-3 h-3" />
															<span>Delete Video</span>
														</button>
													</div>

													<div className="z-10 bg-black/85 px-1.5 py-0.5 rounded text-[9.5px] text-slate-200 truncate font-mono">
														{videoTitle || "Uploaded Video"}
													</div>
												</div>

												{/* 2. Direct Upload Another Video Tile (Always visible for easy 1-click new upload) */}
												<label className="relative rounded-md overflow-hidden border-2 border-dashed border-[#2f323c] hover:border-[#00e5ff]/60 aspect-[4/3] flex flex-col items-center justify-center p-2 text-center bg-[#17181c]/70 hover:bg-[#1c1d22] transition-all cursor-pointer group shadow-sm">
													<div className="w-7 h-7 rounded-full bg-[#1e2026] group-hover:bg-[#00e5ff] text-slate-400 group-hover:text-black flex items-center justify-center transition-all mb-1">
														<Plus className="w-4 h-4 stroke-[2.5]" />
													</div>
													<span className="text-[10px] font-bold text-slate-300 group-hover:text-[#00e5ff] transition-colors leading-tight">
														New Video
													</span>
													<span className="text-[8.5px] text-slate-500 mt-0.5">
														নতুন ভিডিও আপলোড
													</span>
													<input
														type="file"
														accept="video/*"
														onClick={(e) => { e.target.value = null; }}
														onChange={(e) => {
															const f = e.target.files?.[0];
															if (f && onFileUpload) {
																onFileUpload(f);
																e.target.value = "";
															}
														}}
														className="hidden"
													/>
												</label>
											</>
										) : (
											/* Large Full Dropzone when no video is loaded */
											<label className="col-span-2 cursor-pointer border-2 border-dashed border-[#2f323c] hover:border-[#00e5ff]/50 rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center bg-[#17181c] transition-colors">
												<Film className="w-8 h-8 text-slate-500" />
												<span className="text-slate-300 font-bold text-xs">ভিডিও আপলোড করতে এখানে ক্লিক করুন</span>
												<span className="text-[10px] text-slate-500">MP4, MOV, WebM ফাইল সাপোর্ট করে</span>
												<input
													type="file"
													accept="video/*"
													onClick={(e) => { e.target.value = null; }}
													onChange={(e) => {
														const f = e.target.files?.[0];
														if (f && onFileUpload) {
															onFileUpload(f);
															e.target.value = "";
														}
													}}
													className="hidden"
												/>
											</label>
										)}

										{processedVideoUrl && (
											<div className="relative rounded-md overflow-hidden bg-[#0d1f16] border border-emerald-500/60 aspect-[4/3] flex flex-col justify-between p-1.5 group shadow-md transition-all hover:border-emerald-400">
												<div className="flex items-center justify-between z-10">
													<span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded">
														✓ Rendered
													</span>
													<div className="flex items-center gap-1">
														<span className="text-[9px] text-emerald-300 font-mono bg-black/70 px-1 rounded">
															00:{Math.floor(duration || 36).toString().padStart(2, "0")}
														</span>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																if (onDeleteRendered) onDeleteRendered();
															}}
															className="p-1 bg-red-600/85 hover:bg-red-500 text-white rounded transition-colors shadow-sm cursor-pointer z-20"
															title="রেন্ডার করা ফাইল ডিলিট করুন (Clear Rendered Output)"
														>
															<Trash2 className="w-2.5 h-2.5" />
														</button>
													</div>
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

									{/* Action Buttons: 1-Click AI Voice + Full Render */}
									<div className="pt-2 border-t border-[#212328] flex flex-col gap-1.5 shrink-0">
										<button
											type="button"
											onClick={onGenerateVoice}
											disabled={isGeneratingVoice || !uploadedVideo}
											className={`w-full py-1.5 rounded-md font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
												isGeneratingVoice
													? "bg-purple-950/80 text-purple-300 border border-purple-500/50 cursor-wait"
													: voiceoverFileName
													? "bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/60"
													: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950"
											}`}
											title="Generate commentary script and Edge-TTS voiceover instantly"
										>
											{isGeneratingVoice ? (
												<>
													<Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
													<span>Generating AI Voice...</span>
												</>
											) : voiceoverFileName ? (
												<>
													<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
													<span>🎙️ Voice Ready (Click to Re-generate)</span>
												</>
											) : (
												<>
													<span>🎙️ Generate AI Voiceover & Captions</span>
												</>
											)}
										</button>

										<button
											type="button"
											onClick={() => onCreateVideo && onCreateVideo({ forceNewVoice: true })}
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

										{/* Item 4: Highlight Trimmer & Intro Cut Controller */}
										<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2.5">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
													<Scissors className="w-3.5 h-3.5 text-amber-400" />
													<span>ভিডিও ট্রিম ও অপ্রাসঙ্গিক ক্লিপ কাট (Intro Cut)</span>
												</div>
												<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
													<input
														type="checkbox"
														checked={autoTrim40s}
														onChange={(e) => setAutoTrim40s(e.target.checked)}
														className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
													/>
													<span className="font-bold text-amber-400">{autoTrim40s ? "সক্রিয়" : "বন্ধ"}</span>
												</label>
											</div>

											{/* Quick 1-click Intro Cut Buttons */}
											<div className="grid grid-cols-2 gap-1.5">
												<button
													type="button"
													onClick={() => {
														setAutoTrim40s(true);
														setTrimStart(8.5); // Cuts the 8.5s egg/face intro to start at parkour jump!
														setTrimEnd(duration || 45.5);
													}}
													className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
														autoTrim40s && trimStart >= 7
															? "bg-amber-400 text-black border-amber-400 shadow"
															: "bg-[#1c1d24] text-amber-300 border-amber-500/40 hover:border-amber-400"
													}`}
												>
													✂️ শুরুর ৮.৫ সে. বাদ দিন (Skip Intro)
												</button>
												<button
													type="button"
													onClick={() => {
														setAutoTrim40s(false);
														setTrimStart(0);
														setTrimEnd(duration || 45.5);
													}}
													className="py-1.5 px-2 rounded text-[10px] font-bold bg-[#1c1d24] text-slate-300 border border-[#2b2d35] hover:border-white transition-all flex items-center justify-center gap-1 cursor-pointer"
												>
													🔄 পুরো ভিডিও (00:00)
												</button>
											</div>

											{/* Numeric / Slider Controls for Start & End */}
											<div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#26282f]">
												<div className="flex flex-col gap-1">
													<span className="text-[9.5px] text-slate-400 flex justify-between">
														<span>শুরুর সময় (Start):</span>
														<span className="text-amber-300 font-mono font-bold">{Number(trimStart || 0).toFixed(1)}s</span>
													</span>
													<input
														type="range"
														min="0"
														max={Math.max(1, (duration || 45) - 5)}
														step="0.5"
														value={trimStart || 0}
														onChange={(e) => {
															setTrimStart(Number(e.target.value));
															setAutoTrim40s(true);
														}}
														className="w-full accent-amber-400 h-1 bg-[#23242c] rounded cursor-pointer"
													/>
												</div>
												<div className="flex flex-col gap-1">
													<span className="text-[9.5px] text-slate-400 flex justify-between">
														<span>শেষের সময় (End):</span>
														<span className="text-amber-300 font-mono font-bold">{Number(trimEnd || duration || 45).toFixed(1)}s</span>
													</span>
													<input
														type="range"
														min="5"
														max={Math.max(10, duration || 45)}
														step="0.5"
														value={trimEnd || duration || 45}
														onChange={(e) => {
															setTrimEnd(Number(e.target.value));
															setAutoTrim40s(true);
														}}
														className="w-full accent-amber-400 h-1 bg-[#23242c] rounded cursor-pointer"
													/>
												</div>
											</div>
										</div>

										{/* Item 5: Action Cliffhanger Hook (Option 3: Stitches thrilling peak stunt to front with WAIT FOR IT... banner) */}
										<div className={`p-2.5 rounded-lg border transition-all ${cliffhangerHook?.enabled ? "bg-[#1f1505] border-amber-500/80 shadow" : "bg-[#18191c] border-[#26282f]"}`}>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
													<span>🔥 উপায় ৩: অ্যাকশন ক্লিফহ্যাঙ্গার হুক</span>
													<span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
														{cliffhangerHook?.enabled ? "সক্রিয়" : "বন্ধ"}
													</span>
												</div>
												<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
													<input
														type="checkbox"
														checked={Boolean(cliffhangerHook?.enabled)}
														onChange={(e) => {
															const checked = e.target.checked;
															if (setCliffhangerHook) {
																setCliffhangerHook(prev => ({
																	...(prev || {}),
																	enabled: checked,
																	start: prev?.start || 40.5,
																	end: prev?.end || 43.0,
																	text: prev?.text || "WAIT FOR IT... 🔥",
																}));
															}
															if (checked) {
																setAutoTrim40s(true);
																setTrimStart(8.5);
															}
														}}
														className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
													/>
													<span className="font-bold text-amber-400">{cliffhangerHook?.enabled ? "সক্রিয়" : "বন্ধ"}</span>
												</label>
											</div>
											<p className="text-[9.5px] text-slate-300 mt-1 leading-snug">
												ডিমের অপ্রাসঙ্গিক ক্লিপের বদলে ভিডিওর সবচেয়ে রোমাঞ্চকর ব্যাকফ্লিপ স্টান্ট (৪০.৫ সে. - ৪৩ সে.) শুরুতে এনে &ldquo;WAIT FOR IT... 🔥&rdquo; ব্যানার দিয়ে দর্শকদের আটকে রাখা হবে!
											</p>

											<button
												type="button"
												onClick={() => {
													if (setCliffhangerHook) {
														setCliffhangerHook({
															enabled: true,
															start: 40.5,
															end: 43.0,
															text: "WAIT FOR IT... 🔥",
														});
													}
													setAutoTrim40s(true);
													setTrimStart(8.5);
													setTrimEnd(duration || 45.58);
												}}
												className={`mt-2 w-full py-1.5 px-2 rounded text-[10.5px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
													cliffhangerHook?.enabled
														? "bg-amber-400 text-black border-amber-400 shadow font-extrabold"
														: "bg-[#251d10] text-amber-300 border-amber-500/50 hover:bg-amber-400 hover:text-black"
												}`}
											>
												<span>⚡ ১-ক্লিকে উপায় ৩ প্রয়োগ করুন (সেরা পার্কোর হুক)</span>
											</button>

											{cliffhangerHook?.enabled && (
												<div className="mt-2 pt-2 border-t border-amber-500/20 flex flex-col gap-2">
													<div className="flex items-center justify-between text-[9.5px]">
														<span className="text-slate-300">হুক টেক্সট (Hook Text):</span>
														<input
															type="text"
															value={cliffhangerHook?.text || "WAIT FOR IT... 🔥"}
															onChange={(e) => setCliffhangerHook(prev => ({ ...(prev || {}), text: e.target.value }))}
															className="bg-[#121316] border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded text-[10px] w-40 text-center font-bold"
														/>
													</div>
													<div className="grid grid-cols-2 gap-2 text-[9.5px]">
														<div className="flex flex-col gap-0.5">
															<span className="text-slate-400 flex justify-between">
																<span>ক্লিপ শুরু:</span>
																<span className="text-amber-300 font-mono font-bold">{Number(cliffhangerHook?.start || 40.5).toFixed(1)}s</span>
															</span>
															<input
																type="range"
																min="0"
																max={Math.max(1, (duration || 45) - 2)}
																step="0.5"
																value={cliffhangerHook?.start || 40.5}
																onChange={(e) => setCliffhangerHook(prev => ({ ...(prev || {}), start: Number(e.target.value) }))}
																className="accent-amber-400 h-1 bg-[#23242c] rounded cursor-pointer"
															/>
														</div>
														<div className="flex flex-col gap-0.5">
															<span className="text-slate-400 flex justify-between">
																<span>ক্লিপ শেষ:</span>
																<span className="text-amber-300 font-mono font-bold">{Number(cliffhangerHook?.end || 43.0).toFixed(1)}s</span>
															</span>
															<input
																type="range"
																min="1"
																max={Math.max(2, duration || 45)}
																step="0.5"
																value={cliffhangerHook?.end || 43.0}
																onChange={(e) => setCliffhangerHook(prev => ({ ...(prev || {}), end: Number(e.target.value) }))}
																className="accent-amber-400 h-1 bg-[#23242c] rounded cursor-pointer"
															/>
														</div>
													</div>
												</div>
											)}
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
					<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2.5">
						<div className="flex items-center justify-between">
							<span className="text-[11px] font-bold text-white flex items-center gap-1.5">
								<Headphones className="w-3.5 h-3.5 text-[#00e5ff]" />
								<span>Background Music (BGM)</span>
							</span>
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

						{/* Custom Audio Upload & Save Button */}
						<div className="p-2.5 bg-[#121c17] rounded-lg border border-emerald-500/40 flex flex-col gap-1.5">
							<div className="flex items-center justify-between">
								<span className="text-[10.5px] font-bold text-white flex items-center gap-1.5">
									<Upload className="w-3.5 h-3.5 text-emerald-400" />
									<span>আপলোড ও সেভ করুন (Custom Audio / BGM)</span>
								</span>
								{audioSavedToast && (
									<span className="text-[9.5px] text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
										<Check className="w-3 h-3" /> Saved!
									</span>
								)}
							</div>
							<p className="text-[9.5px] text-slate-400">
								আপনার কম্পিউটার থেকে পছন্দের যেকোনো MP3, WAV বা MP4 মিউজিক ফাইল আপলোড করে স্থায়ীভাবে সেভ করুন।
							</p>
							<label className="w-full py-1.5 px-3 bg-[#182620] hover:bg-[#20332b] text-emerald-300 border border-emerald-500/50 rounded flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer transition-all shadow-sm">
								<Plus className="w-3.5 h-3.5 text-emerald-400" />
								<span>{isUploadingAudio ? "Uploading Audio..." : "Upload New BGM Track"}</span>
								<input
									type="file"
									accept="audio/*,video/mp4"
									onChange={handleAudioFileUpload}
									disabled={isUploadingAudio}
									className="hidden"
								/>
							</label>
						</div>

						{/* My Saved Custom Audio Tracks */}
						{savedCustomAudios.length > 0 && (
							<div className="flex flex-col gap-1.5 pt-1">
								<span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
									<BookmarkPlus className="w-3 h-3 text-emerald-400" />
									<span>আমার সেভ করা BGM ({savedCustomAudios.length})</span>
								</span>
								<div className="flex flex-col gap-1.5">
									{savedCustomAudios.map((track, idx) => (
										<div
											key={track.id}
											onClick={() => {
												if (setBgmTrackName) setBgmTrackName(track.id);
												if (setBgmEnabled) setBgmEnabled(true);
											}}
											className={`group p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
												bgmTrackName === track.id
													? "bg-[#0b1b16] border-emerald-500 text-white shadow-md shadow-emerald-950/40"
													: "bg-[#141518] border-[#212328] text-slate-300 hover:border-slate-500 hover:bg-[#1a1b20]"
											}`}
										>
											<div className="flex items-center gap-2 truncate">
												<span className={`w-2 h-2 rounded-full ${bgmTrackName === track.id ? "bg-emerald-400" : "bg-slate-600"}`} />
												<div className="truncate">
													<div className="text-[10.5px] font-bold truncate text-white">{track.name}</div>
													<div className="text-[9px] text-emerald-400/80 font-mono">{track.mood}</div>
												</div>
											</div>
											<div className="flex items-center gap-1 shrink-0">
												{bgmTrackName === track.id && (
													<span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
														Active
													</span>
												)}
												<button
													type="button"
													onClick={(e) => handleDeleteCustomAudio(idx, e)}
													className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
													title="Delete track"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Default Built-in BGM Tracks */}
						<div className="flex flex-col gap-1.5 pt-1">
							<span className="text-[10px] font-bold text-slate-400">Default Built-in BGM Tracks</span>
							{bgmTracks.map((track) => (
								<div
									key={track.id}
									onClick={() => {
										if (setBgmTrackName) setBgmTrackName(track.id);
										if (setBgmEnabled) setBgmEnabled(true);
									}}
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
						<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
							<span>Show Banner Text:</span>
							<input
								type="checkbox"
								checked={showTextOverlay}
								onChange={(e) => setShowTextOverlay(e.target.checked)}
								className="accent-[#00e5ff] w-3.5 h-3.5 cursor-pointer"
							/>
						</label>
					</div>

					{/* ✨ Auto Captions (স্বয়ংক্রিয় সাবটাইটেল) Section */}
					<div className={`p-3 rounded-xl border transition-all ${autoCaption?.enabled ? "bg-[#16171d] border-[#00e5ff]/60 shadow-lg shadow-cyan-950/30" : "bg-[#18191c] border-[#26282f]"}`}>
						<div className="flex items-center justify-between pb-2 border-b border-[#26282f]">
							<div className="flex items-center gap-2">
								<span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#00e5ff] to-blue-500 text-black flex items-center justify-center font-bold text-xs shadow-sm">
									CC
								</span>
								<div>
									<div className="text-[11.5px] font-extrabold text-white flex items-center gap-1.5">
										<span>Auto Captions (স্বয়ংক্রিয় সাবটাইটেল)</span>
										<span className="text-[8.5px] bg-[#00e5ff]/20 text-[#00e5ff] px-1.5 py-0.2 rounded font-mono font-bold">
											{autoCaption?.enabled ? "Active" : "Off"}
										</span>
									</div>
									<p className="text-[9.5px] text-slate-400 mt-0.5">
										ভিডিও ভয়েস বা স্ক্রিপ্ট থেকে স্বয়ংক্রিয়ভাবে ভাইরাল শর্টস ক্যাপশন তৈরি করুন
									</p>
								</div>
							</div>
							<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
								<input
									type="checkbox"
									checked={Boolean(autoCaption?.enabled)}
									onChange={(e) => {
										if (setAutoCaption) {
											setAutoCaption(prev => ({ ...(prev || {}), enabled: e.target.checked }));
										}
									}}
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer"
								/>
								<span className="font-bold text-[#00e5ff]">{autoCaption?.enabled ? "চালু" : "বন্ধ"}</span>
							</label>
						</div>

						{/* 1-Click Generate Auto Captions Button */}
						<div className="mt-2.5">
							<button
								type="button"
								onClick={() => onGenerateAutoCaptions && onGenerateAutoCaptions()}
								disabled={autoCaption?.isGenerating}
								className={`w-full py-2 px-3 rounded-lg text-[11px] font-extrabold border transition-all flex items-center justify-center gap-2 cursor-pointer shadow ${
									autoCaption?.isGenerating
										? "bg-[#202227] text-slate-400 border-[#2f323a] cursor-not-allowed"
										: autoCaption?.segments?.length > 0
										? "bg-[#0c181c] text-[#00e5ff] border-[#00e5ff]/70 hover:bg-[#122329]"
										: "bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] text-black border-transparent hover:brightness-110 shadow-cyan-950/60"
								}`}
							>
								{autoCaption?.isGenerating ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin text-[#00e5ff]" />
										<span>ক্যাপশন তৈরি হচ্ছে... (Analyzing...)</span>
									</>
								) : (
									<>
										<Sparkles className="w-3.5 h-3.5" />
										<span>
											{autoCaption?.segments?.length > 0
												? `🔄 রি-জেনারেট ক্যাপশন (${autoCaption.segments.length} টি ক্লিপ)`
												: "✨ Generate Auto Captions (ক্যাপশন তৈরি করুন)"}
										</span>
									</>
								)}
							</button>
						</div>

						{/* Style Selector: 4 Visual CapCut Presets */}
						<div className="mt-2.5 flex flex-col gap-1.5">
							<span className="text-[10px] font-bold text-slate-300">ক্যাপশন স্টাইল ও অ্যানিমেশন (Caption Style):</span>

							{/* Primary User Style: Typewriter Font 9 Bold Italic (No Border, No BG) */}
							<button
								type="button"
								onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), style: "typewriter_clean", enabled: true }))}
								className={`p-2.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
									(autoCaption?.style === "typewriter_clean" || !autoCaption?.style)
										? "bg-[#0b171f] border-[#00e5ff] text-[#00e5ff] shadow-md shadow-cyan-950/40 ring-1 ring-[#00e5ff]/50"
										: "bg-[#141518] border-[#26282f] text-slate-300 hover:border-slate-500"
								}`}
							>
								<div className="flex flex-col">
									<div className="flex items-center gap-1.5">
										<span className="text-[11px] font-extrabold text-cyan-300">⌨️ Typewriter Animation</span>
										<span className="bg-[#00e5ff]/20 text-[#00e5ff] text-[8px] font-bold px-1 rounded">User Custom</span>
									</div>
									<span className="text-[9px] text-slate-300 font-bold italic mt-0.5">
										Font 9 • Bold Italic • No Border • No Background Box
									</span>
								</div>
								<span className="text-white font-bold italic text-[9px] drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-wider">
									Wait for it... |
								</span>
							</button>

							<div className="grid grid-cols-2 gap-1.5">
								{/* Viral Yellow */}
								<button
									type="button"
									onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), style: "viral_yellow", enabled: true }))}
									className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
										autoCaption?.style === "viral_yellow"
											? "bg-[#25220c] border-yellow-400 text-yellow-300 shadow-md shadow-yellow-950/40"
											: "bg-[#141518] border-[#26282f] text-slate-300 hover:border-slate-500"
									}`}
								>
									<div className="flex flex-col">
										<span className="text-[10px] font-extrabold text-yellow-300">🟡 Viral Yellow</span>
										<span className="text-[8px] text-slate-400">Shorts / Hormozi Style</span>
									</div>
									<span className="px-1 py-0.5 rounded bg-black text-yellow-300 font-black text-[9px] border border-yellow-400">
										WAIT!
									</span>
								</button>

								{/* Classic White */}
								<button
									type="button"
									onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), style: "classic_white", enabled: true }))}
									className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
										autoCaption?.style === "classic_white"
											? "bg-[#1f2025] border-white text-white shadow-md"
											: "bg-[#141518] border-[#26282f] text-slate-300 hover:border-slate-500"
									}`}
								>
									<div className="flex flex-col">
										<span className="text-[10px] font-extrabold text-white">⚪ Classic White</span>
										<span className="text-[8px] text-slate-400">Clean YouTube Outline</span>
									</div>
									<span className="px-1 py-0.5 rounded bg-black/80 text-white font-black text-[9px] border border-white/50">
										LOOK!
									</span>
								</button>

								{/* Neon Cyan */}
								<button
									type="button"
									onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), style: "neon_cyan", enabled: true }))}
									className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
										autoCaption?.style === "neon_cyan"
											? "bg-[#0b1b1f] border-[#00e5ff] text-[#00e5ff] shadow-md shadow-cyan-950/40"
											: "bg-[#141518] border-[#26282f] text-slate-300 hover:border-slate-500"
									}`}
								>
									<div className="flex flex-col">
										<span className="text-[10px] font-extrabold text-[#00e5ff]">🔵 Neon Cyan</span>
										<span className="text-[8px] text-slate-400">Glow & Tech Style</span>
									</div>
									<span className="px-1 py-0.5 rounded bg-black text-[#00e5ff] font-black text-[9px] border border-[#00e5ff]">
										CYAN!
									</span>
								</button>

								{/* Vibrant Green */}
								<button
									type="button"
									onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), style: "green_meme", enabled: true }))}
									className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
										autoCaption?.style === "green_meme"
											? "bg-[#0c1f15] border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/40"
											: "bg-[#141518] border-[#26282f] text-slate-300 hover:border-slate-500"
									}`}
								>
									<div className="flex flex-col">
										<span className="text-[10px] font-extrabold text-emerald-300">🟢 Vibrant Green</span>
										<span className="text-[8px] text-slate-400">Viral Action Highlight</span>
									</div>
									<span className="px-1 py-0.5 rounded bg-black text-emerald-300 font-black text-[9px] border border-emerald-400">
										FIRE!
									</span>
								</button>
							</div>
						</div>

						{/* Position & Scale Adjustments */}
						<div className="mt-2.5 pt-2 border-t border-[#26282f] grid grid-cols-2 gap-2 text-[10px]">
							<div className="flex flex-col gap-1">
								<span className="text-slate-400">পজিশন (Position):</span>
								<div className="grid grid-cols-3 gap-1">
									{["top", "center", "bottom"].map((p) => (
										<button
											key={p}
											type="button"
											onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), position: p }))}
											className={`py-1 rounded font-bold capitalize transition-all border cursor-pointer ${
												(autoCaption?.position || "bottom") === p
													? "bg-[#172b32] border-[#00e5ff] text-[#00e5ff]"
													: "bg-[#121316] border-[#282a32] text-slate-400 hover:text-white"
											}`}
										>
											{p}
										</button>
									))}
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-slate-400 flex justify-between">
									<span>সাইজ (Size):</span>
									<span className="text-[#00e5ff] font-mono font-bold">{(autoCaption?.scale || 1.0).toFixed(1)}x</span>
								</span>
								<input
									type="range"
									min="0.8"
									max="1.8"
									step="0.1"
									value={autoCaption?.scale || 1.0}
									onChange={(e) => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), scale: Number(e.target.value) }))}
									className="w-full accent-[#00e5ff] h-1 bg-[#23242c] rounded cursor-pointer mt-1"
								/>
							</div>
						</div>

						{/* Generated Caption Phrases / Timed Segments Preview */}
						{autoCaption?.segments?.length > 0 && (
							<div className="mt-2.5 pt-2 border-t border-[#26282f] flex flex-col gap-1.5">
								<div className="flex items-center justify-between text-[10px]">
									<span className="font-bold text-[#00e5ff]">
										ক্যাপশন লিস্ট ({autoCaption.segments.length} টি সেগমেন্ট):
									</span>
									<button
										type="button"
										onClick={() => setAutoCaption && setAutoCaption(prev => ({ ...(prev || {}), segments: [] }))}
										className="text-slate-500 hover:text-red-400 text-[9px] transition-colors"
									>
										Clear List
									</button>
								</div>
								<div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1 bg-[#121316] p-1.5 rounded-lg border border-[#26282f]">
									{autoCaption.segments.map((seg, sIdx) => (
										<div
											key={seg.id || sIdx}
											className="flex items-center justify-between gap-1.5 p-1 rounded bg-[#18191c] border border-[#212328] text-[9.5px]"
										>
											<span className="text-slate-500 font-mono text-[8.5px] shrink-0">
												{seg.start}s - {seg.end}s
											</span>
											<input
												type="text"
												value={seg.text}
												onChange={(e) => {
													const updated = [...autoCaption.segments];
													updated[sIdx] = { ...updated[sIdx], text: e.target.value };
													setAutoCaption(prev => ({ ...prev, segments: updated }));
												}}
												className="flex-1 bg-transparent text-slate-200 border-none focus:outline-none focus:bg-[#202227] px-1 rounded truncate font-medium"
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Custom Text Input & Save Button */}
					<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[10.5px] font-bold text-white">Custom Banner Text</span>
							{presetSavedToast && (
								<span className="text-[9.5px] text-[#00e5ff] font-bold flex items-center gap-1 animate-in fade-in">
									<Check className="w-3 h-3" /> Saved!
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={textOverlay}
								onChange={(e) => {
									setTextOverlay(e.target.value);
									setShowTextOverlay(true);
								}}
								placeholder="Type custom text (e.g. শেষ পর্যন্ত দেখুন... 🔥)"
								className="flex-1 bg-[#121316] border border-[#2b2d35] rounded p-2 text-white text-[11px] focus:outline-none focus:border-[#00e5ff] font-bold"
							/>
							<button
								type="button"
								onClick={handleSaveCurrentText}
								className="px-3 py-2 bg-[#00e5ff] hover:bg-[#33ebff] text-black font-extrabold text-[11px] rounded flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow hover:scale-105"
								title="Save this text to your custom saved presets"
							>
								<Save className="w-3.5 h-3.5" />
								<span>Save</span>
							</button>
						</div>
					</div>

					{/* My Saved Presets Section */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[10.5px] font-bold text-[#00e5ff] flex items-center gap-1.5">
								<BookmarkPlus className="w-3.5 h-3.5 text-[#00e5ff]" />
								আমার সেভ করা টেক্সট ({savedCustomPresets.length})
							</span>
							<span className="text-[9px] text-slate-500 font-mono">
								Saved in browser
							</span>
						</div>

						{savedCustomPresets.length === 0 ? (
							<div className="p-3 rounded-lg border border-dashed border-[#2b2d35] bg-[#121316] text-center text-slate-500 text-[10px]">
								ওপরে যেকোনো টেক্সট লিখে <strong className="text-[#00e5ff]">Save</strong> বাটনে চাপলে এখানে স্থায়ীভাবে সেভ হয়ে থাকবে।
							</div>
						) : (
							<div className="grid grid-cols-1 gap-1.5">
								{savedCustomPresets.map((preset, idx) => (
									<div
										key={idx}
										onClick={() => {
											setTextOverlay(preset);
											setShowTextOverlay(true);
										}}
										className={`group flex items-center justify-between p-2 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
											textOverlay === preset && showTextOverlay
												? "bg-[#0b1b1f] border-[#00e5ff] text-yellow-300 shadow-md shadow-cyan-950/40"
												: "bg-[#18191c] border-[#26282f] text-slate-200 hover:border-slate-500 hover:bg-[#1e2026]"
										}`}
									>
										<div className="flex items-center gap-2 truncate">
											<span className="text-[#00e5ff] text-xs">★</span>
											<span className="truncate">{preset}</span>
										</div>
										<button
											type="button"
											onClick={(e) => handleDeleteCustomPreset(idx, e)}
											className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
											title="Delete from saved presets"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					{/* 1-Click Viral Hook Presets */}
					<div className="flex flex-col gap-2">
						<span className="text-[10.5px] font-bold text-slate-300">Viral Hook Presets (Default 1-Click)</span>
						<div className="grid grid-cols-2 gap-2">
							{textPresets.map((preset) => (
								<button
									key={preset}
									type="button"
									onClick={() => {
										setTextOverlay(preset);
										setShowTextOverlay(true);
									}}
									className={`p-2 rounded border text-[10px] font-bold text-left transition-all cursor-pointer truncate ${
										textOverlay === preset && showTextOverlay
											? "bg-[#0c1417] border-[#00e5ff] text-yellow-300 shadow-sm"
											: "bg-[#18191c] border-[#26282f] text-slate-300 hover:text-white hover:border-slate-500"
									}`}
								>
									{preset}
								</button>
							))}
						</div>
					</div>

					{/* Position & Placement Controls */}
					<div className="p-2.5 rounded-lg border bg-[#141518] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between text-[10.5px] font-bold text-white">
							<div className="flex items-center gap-1.5">
								<Move className="w-3.5 h-3.5 text-[#00e5ff]" />
								<span>পজিশন অ্যাডজাস্ট (Placement)</span>
							</div>
							<span className="font-mono text-[#00e5ff] text-[9.5px] bg-[#1a1b20] px-1.5 py-0.5 rounded border border-[#2b2d35]">
								X: {textPosition?.x ?? 50}% | Y: {textPosition?.y ?? 12}%
							</span>
						</div>

						{/* Quick Placement Preset Buttons */}
						<div className="grid grid-cols-3 gap-1.5">
							<button
								type="button"
								onClick={() => setTextPosition && setTextPosition({ x: 50, y: 12 })}
								className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
									textPosition?.y <= 20
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								⬆ Top (12%)
							</button>
							<button
								type="button"
								onClick={() => setTextPosition && setTextPosition({ x: 50, y: 50 })}
								className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
									textPosition?.y > 20 && textPosition?.y < 70
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								⏺ Center (50%)
							</button>
							<button
								type="button"
								onClick={() => setTextPosition && setTextPosition({ x: 50, y: 85 })}
								className={`py-1 px-1.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
									textPosition?.y >= 70
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								⬇ Bottom (85%)
							</button>
						</div>

						<p className="text-[9.5px] text-slate-400 leading-normal pt-0.5">
							💡 <strong>টিপ:</strong> প্লেয়ারের স্ক্রিনে হলুদ টেক্সটটির ওপর মাউস দিয়ে চেপে ধরে ড্র্যাগ (Drag) করে আপনার ইচ্ছেমতো যেকোনো স্থানে টেনে বসাতে পারবেন।
						</p>
					</div>

					{/* Text Size / Scale Control */}
					<div className="p-2.5 rounded-lg border bg-[#141518] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between text-[10.5px] font-bold text-white">
							<div className="flex items-center gap-1.5">
								<Type className="w-3.5 h-3.5 text-yellow-400" />
								<span>টেক্সট সাইজ (ছোট/বড় স্কেল)</span>
							</div>
							<span className="font-mono text-yellow-300 text-[10px] bg-[#1a1b20] px-2 py-0.5 rounded border border-[#2b2d35]">
								{Math.round((textScale ?? 1.0) * 100)}%
							</span>
						</div>

						<div className="flex items-center gap-3 pt-1">
							<span className="text-[10px] text-slate-500 font-bold">ছোট</span>
							<input
								type="range"
								min={0.5}
								max={2.2}
								step={0.05}
								value={textScale ?? 1.0}
								onChange={(e) => setTextScale && setTextScale(Number(e.target.value))}
								className="flex-1 accent-yellow-400 h-1.5 bg-[#25262c] rounded cursor-pointer"
							/>
							<span className="text-[10px] text-yellow-400 font-bold">বড়</span>
						</div>

						{/* Quick Size Presets */}
						<div className="grid grid-cols-4 gap-1.5 pt-0.5">
							{[
								{ label: "Small (70%)", val: 0.7 },
								{ label: "Normal (100%)", val: 1.0 },
								{ label: "Large (135%)", val: 1.35 },
								{ label: "Huge (170%)", val: 1.7 },
							].map((p) => (
								<button
									key={p.val}
									type="button"
									onClick={() => setTextScale && setTextScale(p.val)}
									className={`py-1 rounded text-[9.5px] font-bold border transition-all cursor-pointer text-center ${
										Math.abs((textScale ?? 1.0) - p.val) < 0.05
											? "bg-[#272110] border-yellow-400 text-yellow-300"
											: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
									}`}
								>
									{p.label}
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
						<label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
							<span>Active:</span>
							<input
								type="checkbox"
								checked={showStickerOverlay}
								onChange={(e) => setShowStickerOverlay(e.target.checked)}
								className="accent-[#00e5ff] w-3.5 h-3.5 cursor-pointer"
							/>
						</label>
					</div>

					{/* Custom Sticker Creator & Saver */}
					<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<span className="text-[10.5px] font-bold text-white flex items-center gap-1.5">
								<Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
								<span>কাস্টম স্টিকার তৈরি ও সেভ করুন</span>
							</span>
							{stickerSavedToast && (
								<span className="text-[9.5px] text-[#00e5ff] font-bold flex items-center gap-1 animate-in fade-in">
									<Check className="w-3 h-3" /> Saved!
								</span>
							)}
						</div>

						<div className="flex items-center gap-2">
							<input
								type="text"
								value={customStickerInput}
								onChange={(e) => setCustomStickerInput(e.target.value)}
								placeholder="Emoji or text (e.g. 💥, 🚨, SUBSCRIBE)"
								className="flex-1 bg-[#121316] border border-[#2b2d35] rounded p-2 text-white text-[11px] focus:outline-none focus:border-[#00e5ff] font-bold"
							/>
							<input
								type="text"
								value={customStickerLabel}
								onChange={(e) => setCustomStickerLabel(e.target.value)}
								placeholder="Label (optional)"
								className="w-24 bg-[#121316] border border-[#2b2d35] rounded p-2 text-white text-[11px] focus:outline-none focus:border-[#00e5ff]"
							/>
							<button
								type="button"
								onClick={() => handleSaveCustomSticker()}
								className="px-3 py-2 bg-[#00e5ff] hover:bg-[#33ebff] text-black font-extrabold text-[11px] rounded flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow hover:scale-105"
								title="Save sticker to your custom list"
							>
								<Save className="w-3.5 h-3.5" />
								<span>Save</span>
							</button>
						</div>

						{/* Quick 1-Click Emoji Selector Chips */}
						<div className="flex items-center gap-1.5 flex-wrap pt-0.5">
							{["🔥", "😱", "🚨", "💥", "👇", "🎯", "⭐", "👑", "🎉", "⚡", "💯", "🛑"].map((emoji) => (
								<button
									key={emoji}
									type="button"
									onClick={() => {
										setCustomStickerInput(emoji);
										handleSaveCustomSticker(emoji);
									}}
									className="px-2 py-1 bg-[#141518] hover:bg-[#202227] border border-[#2b2d35] hover:border-[#00e5ff] rounded text-sm transition-all cursor-pointer"
									title={`Add ${emoji}`}
								>
									{emoji}
								</button>
							))}
						</div>
					</div>

					{/* My Saved Custom Stickers Section */}
					{savedCustomStickers.length > 0 && (
						<div className="flex flex-col gap-1.5">
							<span className="text-[10px] font-bold text-[#00e5ff] flex items-center gap-1">
								<BookmarkPlus className="w-3 h-3 text-[#00e5ff]" />
								<span>আমার সেভ করা স্টিকার ({savedCustomStickers.length})</span>
							</span>
							<div className="grid grid-cols-2 gap-2">
								{savedCustomStickers.map((s, idx) => (
									<div
										key={idx}
										onClick={() => {
											setStickerOverlay(s.id);
											setShowStickerOverlay(true);
										}}
										className={`group p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
											stickerOverlay === s.id && showStickerOverlay
												? "bg-[#0c1417] border-[#00e5ff] text-white shadow-md shadow-cyan-950"
												: "bg-[#18191c] border-[#26282f] text-slate-300 hover:border-slate-500 hover:bg-[#1e2026]"
										}`}
									>
										<div className="flex items-center gap-2 truncate">
											<span className="text-xl">{s.id}</span>
											<span className="text-[10.5px] font-bold truncate">{s.label}</span>
										</div>
										<button
											type="button"
											onClick={(e) => handleDeleteCustomSticker(idx, e)}
											className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
											title="Delete sticker"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Default Built-in Stickers */}
					<div className="flex flex-col gap-1.5">
						<span className="text-[10px] font-bold text-slate-400">Default Built-in Stickers</span>
						<div className="grid grid-cols-2 gap-2">
							{stickers.map((s) => (
								<button
									key={s.id}
									type="button"
									onClick={() => {
										setStickerOverlay(s.id);
										setShowStickerOverlay(true);
									}}
									className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
										stickerOverlay === s.id && showStickerOverlay
											? "bg-[#0c1417] border-[#00e5ff] text-white shadow-md shadow-cyan-950"
											: "bg-[#18191c] border-[#26282f] text-slate-300 hover:border-slate-500"
									}`}
								>
									<span className="text-xl">{s.id}</span>
									<div className="text-left truncate">
										<div className="text-[10.5px] font-bold truncate">{s.label}</div>
										<div className="text-[9px] text-slate-500 truncate">{s.subtitle}</div>
									</div>
								</button>
							))}
						</div>
					</div>

					{/* Position & Placement Controls for Sticker */}
					<div className="p-2.5 rounded-lg border bg-[#141518] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between text-[10.5px] font-bold text-white">
							<div className="flex items-center gap-1.5">
								<Move className="w-3.5 h-3.5 text-[#00e5ff]" />
								<span>স্টিকার পজিশন (Placement)</span>
							</div>
							<span className="font-mono text-[#00e5ff] text-[9.5px] bg-[#1a1b20] px-1.5 py-0.5 rounded border border-[#2b2d35]">
								X: {stickerPosition?.x ?? 85}% | Y: {stickerPosition?.y ?? 85}%
							</span>
						</div>

						{/* Quick Placement Preset Buttons for Sticker */}
						<div className="grid grid-cols-4 gap-1.5">
							<button
								type="button"
								onClick={() => setStickerPosition && setStickerPosition({ x: 85, y: 15 })}
								className={`py-1 px-1 rounded text-[9.5px] font-bold transition-all border cursor-pointer text-center ${
									stickerPosition?.y <= 30 && stickerPosition?.x >= 60
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								Top Right
							</button>
							<button
								type="button"
								onClick={() => setStickerPosition && setStickerPosition({ x: 50, y: 50 })}
								className={`py-1 px-1 rounded text-[9.5px] font-bold transition-all border cursor-pointer text-center ${
									stickerPosition?.y > 30 && stickerPosition?.y < 70
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								Center
							</button>
							<button
								type="button"
								onClick={() => setStickerPosition && setStickerPosition({ x: 15, y: 85 })}
								className={`py-1 px-1 rounded text-[9.5px] font-bold transition-all border cursor-pointer text-center ${
									stickerPosition?.y >= 70 && stickerPosition?.x <= 40
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								Bottom Left
							</button>
							<button
								type="button"
								onClick={() => setStickerPosition && setStickerPosition({ x: 85, y: 85 })}
								className={`py-1 px-1 rounded text-[9.5px] font-bold transition-all border cursor-pointer text-center ${
									stickerPosition?.y >= 70 && stickerPosition?.x >= 60
										? "bg-[#1a2d33] border-[#00e5ff] text-[#00e5ff]"
										: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
								}`}
							>
								Bottom Right
							</button>
						</div>

						<p className="text-[9.5px] text-slate-400 leading-normal pt-0.5">
							💡 <strong>টিপ:</strong> প্লেয়ারের স্ক্রিনে স্টিকারটি মাউস দিয়ে চেপে ধরে ড্র্যাগ (Drag) করে যেকোনো পজিশনে টেনে বসাতে পারবেন।
						</p>
					</div>

					{/* Sticker Size / Scale Control */}
					<div className="p-2.5 rounded-lg border bg-[#141518] border-[#26282f] flex flex-col gap-2">
						<div className="flex items-center justify-between text-[10.5px] font-bold text-white">
							<div className="flex items-center gap-1.5">
								<Star className="w-3.5 h-3.5 text-[#00e5ff]" />
								<span>স্টিকার সাইজ (ছোট/বড় স্কেল)</span>
							</div>
							<span className="font-mono text-[#00e5ff] text-[10px] bg-[#1a1b20] px-2 py-0.5 rounded border border-[#2b2d35]">
								{Math.round((stickerScale ?? 1.0) * 100)}%
							</span>
						</div>

						<div className="flex items-center gap-3 pt-1">
							<span className="text-[10px] text-slate-500 font-bold">ছোট</span>
							<input
								type="range"
								min={0.5}
								max={2.5}
								step={0.05}
								value={stickerScale ?? 1.0}
								onChange={(e) => setStickerScale && setStickerScale(Number(e.target.value))}
								className="flex-1 accent-[#00e5ff] h-1.5 bg-[#25262c] rounded cursor-pointer"
							/>
							<span className="text-[10px] text-[#00e5ff] font-bold">বড়</span>
						</div>

						{/* Quick Size Presets */}
						<div className="grid grid-cols-4 gap-1.5 pt-0.5">
							{[
								{ label: "Small (70%)", val: 0.7 },
								{ label: "Normal (100%)", val: 1.0 },
								{ label: "Large (140%)", val: 1.4 },
								{ label: "Huge (190%)", val: 1.9 },
							].map((p) => (
								<button
									key={p.val}
									type="button"
									onClick={() => setStickerScale && setStickerScale(p.val)}
									className={`py-1 rounded text-[9.5px] font-bold border transition-all cursor-pointer text-center ${
										Math.abs((stickerScale ?? 1.0) - p.val) < 0.05
											? "bg-[#102327] border-[#00e5ff] text-[#00e5ff]"
											: "bg-[#1f2025] border-[#2b2d35] text-slate-300 hover:text-white"
									}`}
								>
									{p.label}
								</button>
							))}
						</div>
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
