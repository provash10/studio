"use client";

import React, { useState, useEffect } from "react";
import {
	Shield,
	VolumeX,
	Volume2,
	Music,
	Bot,
	Sparkles,
	Mic,
	Key,
	CheckCircle2,
	FlipHorizontal,
	ZoomIn,
	Palette,
	CheckSquare,
	Sliders,
	Video,
	Wand2,
	Layers,
	ChevronDown,
} from "lucide-react";

export default function CapCutInspector({
	// Mode Switcher Props
	editMode = "auto",
	setEditMode,
	// Right Editing Checklist States
	mirror,
	setMirror,
	applyZoom,
	setApplyZoom,
	colorFilter,
	setColorFilter,
	brightness,
	setBrightness,
	contrast,
	setContrast,
	saturation,
	setSaturation,
	muteOriginalAudio,
	setMuteOriginalAudio,
	bgmEnabled,
	setBgmEnabled,
	bgmTrackName,
	setBgmTrackName,
	bgmVolume,
	setBgmVolume,
	metadataClean = true,
	setMetadataClean,
	voiceoverEnabled,
	setVoiceoverEnabled,
	voiceoverFileName,
	setVoiceoverFileName,
	voiceoverVolume,
	setVoiceoverVolume,
	videoTitle,
}) {
	const [activeTopTab, setActiveTopTab] = useState("video"); // 'video', 'voice', 'animation', 'adjustment'
	const [activeSubTab, setActiveSubTab] = useState("basic"); // 'basic', 'cutout', 'mask'

	// Mock Basic Transform States (authentic CapCut controls)
	const [inspectorScale, setInspectorScale] = useState(100);
	const [posX, setPosX] = useState(0);
	const [posY, setPosY] = useState(0);
	const [rotateDeg, setRotateDeg] = useState(0);
	const [blendMode, setBlendMode] = useState("Normal");
	const [opacityVal, setOpacityVal] = useState(100);

	// AI Script States
	const [scriptText, setScriptText] = useState("");
	const [selectedModel, setSelectedModel] = useState("auto");
	const [selectedLanguage, setSelectedLanguage] = useState("bn");
	const [isGeneratingScript, setIsGeneratingScript] = useState(false);

	// ElevenLabs States
	const [elevenApiKey, setElevenApiKey] = useState("");
	const [elevenVoiceId, setElevenVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
	const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("studio_elevenlabs_key");
			if (saved) setElevenApiKey(saved);
		}
	}, []);

	const handleElevenApiKeyChange = (val) => {
		setElevenApiKey(val);
		if (typeof window !== "undefined") {
			localStorage.setItem("studio_elevenlabs_key", val);
		}
	};

	const handleGenerateScript = async () => {
		setIsGeneratingScript(true);
		try {
			const res = await fetch("/api/ai/script", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: videoTitle || "ভিডিওটির ড্রামাটিক ধারাভাষ্য",
					language: selectedLanguage,
					provider: selectedModel,
					videoTitle,
				}),
			});
			const data = await res.json();
			if (data.script) setScriptText(data.script);
		} catch (err) {
			alert(err.message);
		} finally {
			setIsGeneratingScript(false);
		}
	};

	const handleGenerateElevenLabs = async () => {
		if (!scriptText.trim()) {
			alert("Please click 'Generate Rephrased' first to write a script!");
			return;
		}
		setIsGeneratingVoice(true);
		try {
			const res = await fetch("/api/ai/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: scriptText,
					voiceId: elevenVoiceId,
					apiKey: elevenApiKey || undefined,
				}),
			});
			const data = await res.json();
			if (data.success && data.fileName) {
				setVoiceoverFileName(data.fileName);
				setVoiceoverEnabled(true);
			} else {
				alert(data.error || "Failed to generate voiceover");
			}
		} catch (err) {
			alert(err.message);
		} finally {
			setIsGeneratingVoice(false);
		}
	};

	return (
		<div className="h-full flex flex-col bg-[#141518] border-l border-[#212328] select-none text-xs overflow-hidden">
			{/* Top Bar: In Auto mode shows clean Auto Shield Header; in Manual mode shows CapCut Inspector Tabs */}
			<div className="h-10 bg-[#16171b] border-b border-[#212328] px-2.5 flex items-center justify-between text-slate-400 shrink-0">
				{editMode === "auto" ? (
					<div className="flex items-center justify-between w-full">
						<span className="font-bold text-white text-[11px] flex items-center gap-1.5">
							<Shield className="w-3.5 h-3.5 text-emerald-400" />
							<span>Auto Anti-Copyright Inspector</span>
						</span>
						<span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
							⚡ Auto Active
						</span>
					</div>
				) : (
					<>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setActiveTopTab("video")}
								className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
									activeTopTab === "video"
										? "text-[#00e5ff] border-b-2 border-[#00e5ff] rounded-none"
										: "hover:text-white"
								}`}
							>
								Video
							</button>

							<button
								type="button"
								onClick={() => setActiveTopTab("voice")}
								className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
									activeTopTab === "voice"
										? "text-[#00e5ff] border-b-2 border-[#00e5ff] rounded-none"
										: "hover:text-white"
								}`}
							>
								<Bot className="w-3 h-3 text-[#00e5ff]" />
								<span>AI Voice</span>
							</button>

							<button
								type="button"
								onClick={() => setActiveTopTab("animation")}
								className={`px-2 py-1 rounded text-[10px] transition-colors cursor-pointer ${
									activeTopTab === "animation"
										? "text-white"
										: "text-slate-500 hover:text-slate-300"
								}`}
							>
								Animation
							</button>

							<button
								type="button"
								onClick={() => setActiveTopTab("tracking")}
								className={`px-2 py-1 rounded text-[10px] transition-colors cursor-pointer ${
									activeTopTab === "tracking"
										? "text-white"
										: "text-slate-500 hover:text-slate-300"
								}`}
							>
								Tracking
							</button>
						</div>

						<span className="text-[9px] text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-1.5 py-0.5 rounded font-mono font-bold">
							Manual Mode
						</span>
					</>
				)}
			</div>

			{/* Content Area */}
			<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-slate-300">
				{editMode === "auto" ? (
					/* ⚡ AUTO MODE: 100% CLEAN, ZERO SLIDERS, ZERO CLUTTER */
					<div className="flex flex-col gap-3">
						<div className="p-4 bg-[#0a1612] border border-emerald-500/40 rounded-xl flex flex-col gap-3 shadow-lg">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs">
									<span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
									<span>⚡ Auto Mode (All OK)</span>
								</div>
								<span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
									Active
								</span>
							</div>

							<p className="text-[11px] text-slate-300 leading-relaxed">
								কোনো স্লাইডার বা অপশন ম্যানুয়ালি পরিবর্তন করার দরকার নেই। আপনি শুধু ভিডিও আপলোড করে প্লেয়ারের <strong className="text-[#00e5ff] font-bold">⚡ Create Video</strong> বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে ভিডিও তৈরি হয়ে যাবে।
							</p>

							<div className="bg-[#101f18] p-3 rounded-lg border border-emerald-500/30 flex flex-col gap-2 text-[10.5px]">
								<span className="font-bold text-white text-[11px] pb-1 border-b border-emerald-500/20">
									🛡️ স্বয়ংক্রিয়ভাবে অ্যাপ্লাই হবে:
								</span>
								<div className="grid grid-cols-1 gap-1.5 text-emerald-300">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Solid Black Base Canvas [black.jpg]</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Video Scale & Centering (94% Framing)</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Safe 2% Zoom (Top Anchor Headroom)</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Horizontal Flip / Mirror Frame</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Cinematic Color Grading & Curves</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>100% Original Audio Muted</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Clean Looped BGM Mix</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>AI Script & Voiceover (ElevenLabs / Audio Studio)</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
										<span>Metadata Wipe (-map_metadata -1)</span>
									</div>
								</div>
							</div>

							<button
								type="button"
								onClick={() => setEditMode && setEditMode("manual")}
								className="mt-1 py-2 px-3 bg-[#18191c] hover:bg-[#202227] text-[#00e5ff] border border-[#00e5ff]/50 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
							>
								<Sliders className="w-3.5 h-3.5" />
								<span>⚙️ ম্যানুয়ালি টিক বা অ্যাডজাস্ট করতে Switch করুন</span>
							</button>
						</div>
					</div>
				) : activeTopTab === "video" ? (
					<>
						{/* RIGHT VIDEO EDITING CHECKLIST (Show at top of manual mode for ticking!) */}
						<div className="flex flex-col gap-2.5">
							<div className="flex items-center justify-between pb-1 border-b border-[#212328]">
								<span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
									<Shield className="w-3.5 h-3.5 text-[#00e5ff]" />
									Right Video Editing Checklist
								</span>
								<span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
									Manual: টিক করুন
								</span>
							</div>

							{/* Item 1: Horizontal Flip (Mirror) */}
							<div
								className={`p-2.5 rounded-lg border transition-all ${
									mirror
										? "bg-[#0c1417] border-[#00e5ff]/60 text-white"
										: "bg-[#18191c] border-[#26282f] text-slate-400"
								}`}
							>
								<label className="flex items-start justify-between cursor-pointer gap-2">
									<div>
										<div className="text-[11px] font-bold text-white flex items-center gap-1">
											<FlipHorizontal className="w-3 h-3 text-[#00e5ff]" />
											<span>1. Horizontal Flip (Mirror)</span>
										</div>
										<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
											Flips frame horizontally to break YouTube bot pattern matching.
										</p>
									</div>
									<input
										type="checkbox"
										checked={mirror}
										onChange={(e) => setMirror(e.target.checked)}
										className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
									/>
								</label>
							</div>

							{/* Item 2: Safe 2% Zoom (Top Anchor Headroom Protection) */}
							<div
								className={`p-2.5 rounded-lg border transition-all ${
									applyZoom
										? "bg-[#150f1f] border-purple-500/60"
										: "bg-[#18191c] border-[#26282f]"
								}`}
							>
								<label className="flex items-start justify-between cursor-pointer gap-2">
									<div>
										<div className="text-[11px] font-bold text-white flex items-center gap-1">
											<ZoomIn className="w-3 h-3 text-purple-400" />
											<span>2. Safe 2% Zoom (Top Anchor)</span>
										</div>
										<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
											Docs 1.02x zoom with top anchor; protects caps, heads, and clocks.
										</p>
									</div>
									<input
										type="checkbox"
										checked={applyZoom}
										onChange={(e) => setApplyZoom(e.target.checked)}
										className="accent-purple-500 w-4 h-4 cursor-pointer mt-0.5"
									/>
								</label>
							</div>

							{/* Item 3: Color Grading & Histogram Shift */}
							<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
								<label className="flex items-start justify-between cursor-pointer gap-2">
									<div>
										<div className="text-[11px] font-bold text-white flex items-center gap-1">
											<Palette className="w-3 h-3 text-amber-400" />
											<span>3. Color Grading & Histogram Shift</span>
										</div>
										<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
											Shifts color balance away from original video histogram.
										</p>
									</div>
									<input
										type="checkbox"
										checked={colorFilter !== "none"}
										onChange={(e) =>
											setColorFilter(e.target.checked ? "cinematic" : "none")
										}
										className="accent-amber-400 w-4 h-4 cursor-pointer mt-0.5"
									/>
								</label>

								{colorFilter !== "none" && (
									<div className="flex flex-col gap-2 pt-1 border-t border-[#212328]">
										<div className="flex items-center gap-1.5">
											<span className="text-[10px] text-slate-400">Filter:</span>
											<div className="flex items-center gap-1 flex-1">
												{["cinematic", "vivid", "warm"].map((flt) => (
													<button
														key={flt}
														type="button"
														onClick={() => setColorFilter(flt)}
														className={`flex-1 py-0.5 rounded text-[10px] capitalize transition-all cursor-pointer ${
															colorFilter === flt
																? "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold"
																: "bg-[#121316] text-slate-400 hover:text-white"
														}`}
													>
														{flt}
													</button>
												))}
											</div>
										</div>

										<div className="flex items-center justify-between text-[10px]">
											<span className="text-slate-400">Bright:</span>
											<input
												type="range"
												min={-0.1}
												max={0.15}
												step={0.01}
												value={brightness}
												onChange={(e) =>
													setBrightness(Number.parseFloat(e.target.value))
												}
												className="w-24 accent-amber-400 h-1 bg-[#25262c] rounded cursor-pointer"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Item 4: Mute Original Audio (100%) */}
							<div
								className={`p-2.5 rounded-lg border transition-all ${
									muteOriginalAudio
										? "bg-[#1a0f12] border-rose-500/60"
										: "bg-[#18191c] border-[#26282f]"
								}`}
							>
								<label className="flex items-start justify-between cursor-pointer gap-2">
									<div>
										<div className="text-[11px] font-bold text-white flex items-center gap-1">
											<VolumeX className="w-3 h-3 text-rose-400" />
											<span>4. Mute Original Audio (100%)</span>
										</div>
										<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
											Strip original audio completely so no acoustic match exists.
										</p>
									</div>
									<input
										type="checkbox"
										checked={muteOriginalAudio}
										onChange={(e) => setMuteOriginalAudio(e.target.checked)}
										className="accent-rose-500 w-4 h-4 cursor-pointer mt-0.5"
									/>
								</label>
							</div>

							{/* Item 5: Looped BGM Mix */}
							<div
								className={`p-2.5 rounded-lg border transition-all ${
									bgmEnabled
										? "bg-[#0d1620] border-[#00e5ff]/60"
										: "bg-[#18191c] border-[#26282f]"
								}`}
							>
								<label className="flex items-start justify-between cursor-pointer gap-2">
									<div>
										<div className="text-[11px] font-bold text-white flex items-center gap-1">
											<Music className="w-3 h-3 text-[#00e5ff]" />
											<span>5. Looped BGM Mix (Software/aud)</span>
										</div>
										<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
											Mixes clean copyright-free background music underneath.
										</p>
									</div>
									<input
										type="checkbox"
										checked={bgmEnabled}
										onChange={(e) => setBgmEnabled(e.target.checked)}
										className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
									/>
								</label>

								{/* Compact Manual Controls */}
								{bgmEnabled && (
									<div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#212328]">
										<div className="flex items-center justify-between">
											<span className="text-slate-400">Track:</span>
											<select
												value={bgmTrackName}
												onChange={(e) => setBgmTrackName(e.target.value)}
												className="bg-[#121316] border border-[#2b2d35] rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
											>
												<option value="bg1.mp4">bg1.mp4</option>
												<option value="bg2.mp4">bg2.mp4</option>
												<option value="bg3.mp4">bg3.mp4</option>
												<option value="bg4.mp4">bg4.mp4</option>
											</select>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-slate-400">Vol:</span>
											<input
												type="range"
												min={0.05}
												max={0.5}
												step={0.05}
												value={bgmVolume}
												onChange={(e) =>
													setBgmVolume(Number.parseFloat(e.target.value))
												}
												className="w-14 accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Item 6: Metadata Cleansing (-map_metadata -1) */}
							<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex items-center justify-between">
								<div>
									<div className="text-[11px] font-bold text-white">
										6. Metadata Stripping (-map_metadata -1)
									</div>
									<div className="text-[9px] text-slate-500">
										Wipes camera, creation dates, and digital hash.
									</div>
								</div>
								<input
									type="checkbox"
									checked={metadataClean}
									onChange={(e) => setMetadataClean(e.target.checked)}
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer"
								/>
							</div>
						</div>

						{/* CapCut Sub-Tabs: Basic, Cutout, Mask, Enhance */}
						<div className="flex items-center gap-1 bg-[#1a1b20] p-0.5 rounded border border-[#26282f] shrink-0 mt-2">
							{["Basic", "Cutout", "Mask", "Enhance"].map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveSubTab(tab.toLowerCase())}
									className={`flex-1 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
										activeSubTab === tab.toLowerCase()
											? "bg-[#282a32] text-white shadow-sm"
											: "text-slate-400 hover:text-slate-200"
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						{/* CapCut Authentic Basic Transform Controls */}
						<div className="bg-[#18191c] border border-[#26282f] rounded-lg p-2.5 flex flex-col gap-2.5">
							{/* Scale */}
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-400">Scale</span>
								<div className="flex items-center gap-2">
									<input
										type="range"
										min={50}
										max={150}
										value={inspectorScale}
										onChange={(e) => setInspectorScale(Number(e.target.value))}
										className="w-24 accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
									/>
									<span className="font-mono text-slate-200 w-10 text-right bg-[#121316] px-1 py-0.5 rounded border border-[#2b2d35]">
										{inspectorScale}%
									</span>
								</div>
							</div>

							{/* Position */}
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-400">Position</span>
								<div className="flex items-center gap-1.5 font-mono text-[10px]">
									<div className="flex items-center bg-[#121316] border border-[#2b2d35] rounded px-1.5 py-0.5 gap-1">
										<span className="text-slate-500">X</span>
										<input
											type="number"
											value={posX}
											onChange={(e) => setPosX(Number(e.target.value))}
											className="w-8 bg-transparent text-white focus:outline-none"
										/>
									</div>
									<div className="flex items-center bg-[#121316] border border-[#2b2d35] rounded px-1.5 py-0.5 gap-1">
										<span className="text-slate-500">Y</span>
										<input
											type="number"
											value={posY}
											onChange={(e) => setPosY(Number(e.target.value))}
											className="w-8 bg-transparent text-white focus:outline-none"
										/>
									</div>
								</div>
							</div>

							{/* Rotate */}
							<div className="flex items-center justify-between text-[11px]">
								<span className="text-slate-400">Rotate</span>
								<div className="flex items-center bg-[#121316] border border-[#2b2d35] rounded px-2 py-0.5 font-mono text-[10px]">
									<input
										type="number"
										value={rotateDeg}
										onChange={(e) => setRotateDeg(Number(e.target.value))}
										className="w-8 bg-transparent text-white focus:outline-none"
									/>
									<span className="text-slate-500">°</span>
								</div>
							</div>

							{/* Blend Mode & Opacity */}
							<div className="pt-2 border-t border-[#212328] flex flex-col gap-2">
								<div className="flex items-center justify-between text-[11px]">
									<span className="text-slate-400 flex items-center gap-1">
										<span className="w-3 h-3 rounded-full border border-[#00e5ff] flex items-center justify-center text-[8px] text-[#00e5ff]">
											✓
										</span>
										<span>Blend Mode</span>
									</span>
									<select
										value={blendMode}
										onChange={(e) => setBlendMode(e.target.value)}
										className="bg-[#121316] border border-[#2b2d35] rounded px-2 py-0.5 text-slate-200 text-[10px]"
									>
										<option value="Normal">Normal</option>
										<option value="Multiply">Multiply</option>
										<option value="Screen">Screen</option>
										<option value="Overlay">Overlay</option>
									</select>
								</div>

								<div className="flex items-center justify-between text-[11px]">
									<span className="text-slate-400">Opacity</span>
									<div className="flex items-center gap-2">
										<input
											type="range"
											min={0}
											max={100}
											value={opacityVal}
											onChange={(e) => setOpacityVal(Number(e.target.value))}
											className="w-24 accent-[#00e5ff] h-1 bg-[#25262c] rounded cursor-pointer"
										/>
										<span className="font-mono text-slate-200 w-10 text-right bg-[#121316] px-1 py-0.5 rounded border border-[#2b2d35]">
											{opacityVal}%
										</span>
									</div>
								</div>
							</div>
						</div>
					</>
				) : activeTopTab === "voice" ? (
					/* AI VOICE STUDIO TAB */
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between pb-1 border-b border-[#212328]">
							<span className="font-bold text-white text-[11px] flex items-center gap-1.5">
								<Bot className="w-3.5 h-3.5 text-[#00e5ff]" />
								Rephrased AI Commentary Script
							</span>
							<button
								type="button"
								onClick={handleGenerateScript}
								disabled={isGeneratingScript}
								className="px-2.5 py-1 bg-[#00e5ff] text-black font-extrabold text-[10px] rounded hover:bg-[#00cbe2] disabled:opacity-50 cursor-pointer"
							>
								{isGeneratingScript ? "Writing..." : "Generate Rephrased"}
							</button>
						</div>

						<p className="text-[9px] text-slate-400 leading-snug">
							AI will paraphrase and create unique transformative commentary (e.g. &ldquo;Here we go&rdquo; or fresh contextual dialogue instead of &ldquo;Let&apos;s go&rdquo;).
						</p>

						<textarea
							rows={4}
							value={scriptText}
							onChange={(e) => setScriptText(e.target.value)}
							placeholder="AI will generate rephrased transformative commentary..."
							className="w-full bg-[#1a1b20] border border-[#2b2d35] rounded p-2 text-slate-200 text-[11px] focus:outline-none focus:border-[#00e5ff] leading-relaxed"
						/>

						{/* ElevenLabs Settings */}
						<div className="flex flex-col gap-2 pt-2 border-t border-[#212328]">
							<span className="font-bold text-white text-[11px]">
								ElevenLabs AI Voiceover
							</span>
							<input
								type="password"
								placeholder="Paste ElevenLabs API Key (or leave blank for built-in)..."
								value={elevenApiKey}
								onChange={(e) => handleElevenApiKeyChange(e.target.value)}
								className="bg-[#1a1b20] border border-[#2b2d35] rounded p-1.5 text-[11px] text-white focus:outline-none focus:border-[#00e5ff]"
							/>
							<div className="flex items-center gap-2">
								<select
									value={elevenVoiceId}
									onChange={(e) => setElevenVoiceId(e.target.value)}
									className="flex-1 bg-[#1a1b20] border border-[#2b2d35] rounded p-1.5 text-[10px] text-slate-300"
								>
									<option value="21m00Tcm4TlvDq8ikWAM">Rachel (Calm)</option>
									<option value="pNInz6obpgDQGcFmaJgB">Adam (Deep)</option>
									<option value="ErXwobaYiN019PkySvjV">Antoni (Energetic)</option>
								</select>

								<button
									type="button"
									onClick={handleGenerateElevenLabs}
									disabled={isGeneratingVoice}
									className="px-3 py-1.5 bg-[#1f2025] hover:bg-[#282a32] text-[#00e5ff] border border-[#00e5ff]/50 rounded font-bold text-[10px] flex items-center justify-center gap-1 disabled:opacity-50 shrink-0 cursor-pointer"
								>
									<Bot className="w-3 h-3" />
									{isGeneratingVoice ? "Synthesizing..." : "Create Voice"}
								</button>
							</div>
						</div>

						{voiceoverFileName && (
							<div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-[10px] text-emerald-300 flex items-center gap-1.5">
								<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
								<span>Voiceover ready and mapped to timeline!</span>
							</div>
						)}
					</div>
				) : (
					<div className="p-4 text-center text-slate-500 text-[11px]">
						Select Video or AI Voice tab above to configure properties.
					</div>
				)}
			</div>
		</div>
	);
}
