"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function CapCutInspector({
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
	const [activeTopTab, setActiveTopTab] = useState("checklist"); // 'checklist', 'voice', 'details'

	// AI Script States
	const [scriptText, setScriptText] = useState("");
	const [selectedModel, setSelectedModel] = useState("auto");
	const [selectedLanguage, setSelectedLanguage] = useState("bn");
	const [isGeneratingScript, setIsGeneratingScript] = useState(false);

	// ElevenLabs States
	const [elevenApiKey, setElevenApiKey] = useState("");
	const [elevenVoiceId, setElevenVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
	const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

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
			alert("Please click 'Generate Rephrased Script' first!");
			return;
		}
		if (!elevenApiKey.trim()) {
			alert("Please paste your ElevenLabs API Key!");
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
					apiKey: elevenApiKey,
				}),
			});
			const data = await res.json();
			if (data.success && data.fileName) {
				setVoiceoverFileName(data.fileName);
				setVoiceoverEnabled(true);
			}
		} catch (err) {
			alert(err.message);
		} finally {
			setIsGeneratingVoice(false);
		}
	};

	return (
		<div className="h-full flex flex-col bg-[#141518] border-l border-[#212328] select-none text-xs">
			{/* Top Tabs: Right Editing Checklist, AI Voice Studio, Details */}
			<div className="h-10 bg-[#16171b] border-b border-[#212328] px-3 flex items-center justify-between text-slate-400 shrink-0">
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => setActiveTopTab("checklist")}
						className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
							activeTopTab === "checklist"
								? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<CheckSquare className="w-3 h-3" />
						<span>Right Editing Checklist</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTopTab("voice")}
						className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
							activeTopTab === "voice"
								? "bg-[#25262c] text-white"
								: "text-slate-400 hover:text-white"
						}`}
					>
						AI Voice Studio
					</button>
				</div>

				<span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
					Anti-Copyright
				</span>
			</div>

			{/* Content Area: Filling the Right Red-Marked Space */}
			<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-slate-300">
				{activeTopTab === "checklist" ? (
					/* RIGHT EDITING CHECKLIST (With checkmarks + compact manual sliders) */
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
							<span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
								<Shield className="w-3.5 h-3.5 text-[#00e5ff]" />
								Right Video Editing Checklist
							</span>
							<span className="text-[9px] text-[#00e5ff] font-mono">
								Zero Copyright
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
										Flips frame horizontally to break YouTube bot pattern
										matching.
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
										Docs 1.02x zoom with top anchor; protects caps, heads, and
										clocks.
									</p>
								</div>
								<input
									type="checkbox"
									checked={applyZoom}
									onChange={(e) => setApplyZoom(e.target.checked)}
									className="accent-purple-400 w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>
						</div>

						{/* Item 3: Color Grading & Histogram Shift */}
						<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white flex items-center gap-1">
										<Palette className="w-3 h-3 text-cyan-400" />
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
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>

							{/* Compact Manual Controls */}
							<div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#212328]">
								<div className="flex items-center justify-between">
									<span className="text-slate-400">Filter:</span>
									<select
										value={colorFilter}
										onChange={(e) => setColorFilter(e.target.value)}
										className="bg-[#121316] border border-[#2b2d35] rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
									>
										<option value="cinematic">Cinematic</option>
										<option value="vivid">Vivid</option>
										<option value="warm">Warm</option>
										<option value="none">Normal</option>
									</select>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-slate-400">Bright:</span>
									<input
										type="range"
										min={-0.08}
										max={0.08}
										step={0.01}
										value={brightness}
										onChange={(e) =>
											setBrightness(Number.parseFloat(e.target.value))
										}
										className="w-14 accent-[#00e5ff] h-1 bg-[#25262c] rounded"
									/>
								</div>
							</div>
						</div>

						{/* Item 4: Mute Original Audio (100% Zero Copyright) */}
						<div
							className={`p-2.5 rounded-lg border transition-all ${
								muteOriginalAudio
									? "bg-[#1f0f12] border-rose-500/60"
									: "bg-[#18191c] border-[#26282f]"
							}`}
						>
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
										<VolumeX className="w-3.5 h-3.5 text-rose-400" />
										<span>4. Mute Original Audio (100%)</span>
									</div>
									<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
										Strips original audio completely so no acoustic match exists.
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

						{/* Item 5: Looped Background Music (BGM Mix) */}
						<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
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
											className="w-14 accent-[#00e5ff] h-1 bg-[#25262c] rounded"
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
				) : (
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
								className="px-2.5 py-1 bg-[#00e5ff] text-black font-extrabold text-[10px] rounded hover:bg-[#00cbe2] disabled:opacity-50"
							>
								{isGeneratingScript ? "Writing..." : "Generate Rephrased"}
							</button>
						</div>

						<textarea
							rows={4}
							value={scriptText}
							onChange={(e) => setScriptText(e.target.value)}
							placeholder="AI will watch video context and create rephrased commentary (e.g. 'As we go' instead of 'Let's go')..."
							className="w-full bg-[#1a1b20] border border-[#2b2d35] rounded p-2 text-slate-200 text-[11px] focus:outline-none focus:border-[#00e5ff] leading-relaxed"
						/>

						{/* ElevenLabs Settings */}
						<div className="flex flex-col gap-2 pt-2 border-t border-[#212328]">
							<span className="font-bold text-white text-[11px]">
								ElevenLabs AI Voiceover
							</span>
							<input
								type="password"
								placeholder="Paste ElevenLabs API Key..."
								value={elevenApiKey}
								onChange={(e) => setElevenApiKey(e.target.value)}
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
									className="px-3 py-1.5 bg-[#1f2025] hover:bg-[#282a32] text-[#00e5ff] border border-[#00e5ff]/50 rounded font-bold text-[10px] flex items-center justify-center gap-1 disabled:opacity-50 shrink-0"
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
				)}
			</div>
		</div>
	);
}
