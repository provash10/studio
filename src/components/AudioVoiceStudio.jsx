"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	Volume2,
	VolumeX,
	Music,
	Mic,
	Bot,
	Sparkles,
	Play,
	Square,
	Key,
	CheckCircle2,
	Radio,
	Eye,
	ArrowRight,
	ShieldCheck,
} from "lucide-react";

export default function AudioVoiceStudio({
	bgms = [],
	bgmEnabled,
	setBgmEnabled,
	bgmTrackName,
	setBgmTrackName,
	bgmVolume,
	setBgmVolume,
	muteOriginalAudio,
	setMuteOriginalAudio,
	originalVolume,
	setOriginalVolume,
	applyAudioEqualizer,
	setApplyAudioEqualizer,
	voiceoverEnabled,
	setVoiceoverEnabled,
	voiceoverFileName,
	setVoiceoverFileName,
	voiceoverVolume,
	setVoiceoverVolume,
	videoTitle = "",
}) {
	// Script Generation States
	const [scriptText, setScriptText] = useState("");
	const [promptInput, setPromptInput] = useState("");
	const [selectedModel, setSelectedModel] = useState("auto"); // 'auto', 'gemini', 'openai'
	const [selectedLanguage, setSelectedLanguage] = useState("bn");
	const [apiKey, setApiKey] = useState("");
	const [isGeneratingScript, setIsGeneratingScript] = useState(false);
	const [scriptSource, setScriptSource] = useState("");

	// Voiceover Engine States
	const [voiceTab, setVoiceTab] = useState("elevenlabs"); // 'elevenlabs', 'manual'
	const [elevenApiKey, setElevenApiKey] = useState("");
	const [elevenVoiceId, setElevenVoiceId] = useState("21m00Tcm4TlvDq8ikWAM"); // Rachel default
	const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
	const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState(null);

	// Microphone Recording States
	const [isRecording, setIsRecording] = useState(false);
	const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);

	// ElevenLabs Voices
	const elevenVoices = [
		{ id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Calm & Professional)" },
		{ id: "pNInz6obpgDQGcFmaJgB", name: "Adam (Deep & Narrator)" },
		{ id: "ErXwobaYiN019PkySvjV", name: "Antoni (Energetic & Dynamic)" },
		{ id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Expressive & Emotional)" },
		{ id: "VR6AewLTigWG4xSOukaG", name: "Arnold (Dramatic)" },
	];

	// Handle AI Video Analysis & Script Generation
	const handleGenerateScript = async () => {
		setIsGeneratingScript(true);
		try {
			const res = await fetch("/api/ai/script", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt:
						promptInput ||
						(videoTitle
							? `এই ভিডিওটি এনালাইজ করে আকর্ষনীয় ধারাভাষ্য: ${videoTitle}`
							: "এই ভিডিওটির উত্তেজনাপূর্ণ মুহূর্তের ওপর একটি আকর্ষণীয় ধারাভাষ্য"),
					language: selectedLanguage,
					provider: selectedModel,
					apiKey: apiKey || undefined,
					videoTitle,
				}),
			});
			const data = await res.json();
			if (data.script) {
				setScriptText(data.script);
				setScriptSource(data.source);
			} else {
				alert(data.error || "Failed to generate script");
			}
		} catch (err) {
			alert(err.message);
		} finally {
			setIsGeneratingScript(false);
		}
	};

	// Handle ElevenLabs Voice Generation
	const handleGenerateElevenLabs = async () => {
		if (!scriptText.trim()) {
			alert(
				"Please click 'AI Watch Video & Generate Script' first or write a script!",
			);
			return;
		}
		// Allow ElevenLabs or fallback to Studio AI Voice Engine automatically
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
				setGeneratedVoiceUrl(data.url);
			} else {
				alert(data.error || "Failed to generate voiceover");
			}
		} catch (err) {
			alert(err.message);
		} finally {
			setIsGeneratingVoice(false);
		}
	};

	// Start Live Mic Recording
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorderRef.current = new MediaRecorder(stream);
			audioChunksRef.current = [];

			mediaRecorderRef.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorderRef.current.onstop = async () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/mp3",
				});
				const url = URL.createObjectURL(audioBlob);
				setRecordedAudioUrl(url);

				// Upload recorded blob to server
				const formData = new FormData();
				formData.append("audio", audioBlob, "recorded_mic.mp3");

				const uploadRes = await fetch("/api/ai/tts", {
					method: "POST",
					body: formData,
				});
				const data = await uploadRes.json();
				if (data.success && data.fileName) {
					setVoiceoverFileName(data.fileName);
					setVoiceoverEnabled(true);
				}
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
		} catch (err) {
			alert("Microphone access denied: " + err.message);
		}
	};

	// Stop Live Mic Recording
	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	return (
		<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
			<div className="flex items-center justify-between pb-3 border-b border-slate-800">
				<div className="flex items-center gap-2">
					<Bot className="w-5 h-5 text-purple-400" />
					<h3 className="text-sm font-bold uppercase tracking-wider text-white">
						AI Script & Voice Studio
					</h3>
				</div>
				<span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
					<ShieldCheck className="w-3.5 h-3.5" />
					Zero Audio Copyright
				</span>
			</div>

			{/* 1. ORIGINAL AUDIO MUTE CONTROLLER (CRITICAL FOR COPYRIGHT BYPASS) */}
			<div
				className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
					muteOriginalAudio
						? "bg-rose-950/30 border-rose-500/50"
						: "bg-slate-950/60 border-slate-800"
				}`}
			>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setMuteOriginalAudio(!muteOriginalAudio)}
						className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
							muteOriginalAudio
								? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
								: "bg-slate-800 text-slate-400 hover:text-white"
						}`}
					>
						{muteOriginalAudio ? (
							<VolumeX className="w-5 h-5" />
						) : (
							<Volume2 className="w-5 h-5" />
						)}
					</button>
					<div>
						<div className="text-xs font-bold text-white flex items-center gap-1.5">
							Mute Original Video Sound (100%)
							{muteOriginalAudio && (
								<span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
									MUTED
								</span>
							)}
						</div>
						<p className="text-[11px] text-slate-400 mt-0.5">
							Eliminates original audio completely to guarantee zero copyright
							claim!
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={() => setMuteOriginalAudio(!muteOriginalAudio)}
					className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
						muteOriginalAudio
							? "bg-rose-500 text-white"
							: "bg-slate-800 text-slate-400 hover:bg-slate-700"
					}`}
				>
					{muteOriginalAudio ? "✓ Muted" : "Unmute"}
				</button>
			</div>

			{/* 2. AI SCRIPT GENERATOR (WATCH VIDEO & WRITE COMMENTARY) */}
			<div className="flex flex-col gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
						<Eye className="w-3.5 h-3.5 text-purple-400" />
						Step 1: AI Watch Video & Generate Voiceover Script
					</span>
					{scriptSource && (
						<span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
							{scriptSource}
						</span>
					)}
				</div>

				<div className="grid grid-cols-2 gap-2 text-xs">
					<select
						value={selectedModel}
						onChange={(e) => setSelectedModel(e.target.value)}
						className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2"
					>
						<option value="auto">Built-in Viral Narrator (Free / Auto)</option>
						<option value="gemini">Google Gemini AI</option>
						<option value="openai">ChatGPT (GPT-4o)</option>
					</select>

					<select
						value={selectedLanguage}
						onChange={(e) => setSelectedLanguage(e.target.value)}
						className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2"
					>
						<option value="bn">বাংলা (Bengali Commentary)</option>
						<option value="en">English (Viral Shorts Voice)</option>
					</select>
				</div>

				{selectedModel !== "auto" && (
					<input
						type="password"
						placeholder={`Enter your ${
							selectedModel === "gemini" ? "Gemini" : "OpenAI"
						} API Key...`}
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:border-purple-500 focus:outline-none"
					/>
				)}

				<div className="flex gap-2">
					<input
						type="text"
						placeholder={
							videoTitle
								? `Context: ${videoTitle}`
								: "Optional custom prompt / context..."
						}
						value={promptInput}
						onChange={(e) => setPromptInput(e.target.value)}
						className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:border-purple-500 focus:outline-none"
					/>
					<button
						type="button"
						onClick={handleGenerateScript}
						disabled={isGeneratingScript}
						className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow shrink-0"
					>
						<Sparkles className="w-3.5 h-3.5 text-amber-300" />
						{isGeneratingScript ? "AI Analyzing..." : "Generate Script"}
					</button>
				</div>

				<textarea
					rows={3}
					value={scriptText}
					onChange={(e) => setScriptText(e.target.value)}
					placeholder="The AI commentary script will appear here. You can also customize or edit any line..."
					className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none leading-relaxed"
				/>
			</div>

			{/* 3. VOICEOVER ENGINE (ELEVENLABS / FREE MIC RECORDING) */}
			<div className="flex flex-col gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
						<Mic className="w-3.5 h-3.5 text-emerald-400" />
						Step 2: Generate Voiceover (ElevenLabs / Mic)
					</span>
					<div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
						<button
							type="button"
							onClick={() => setVoiceTab("elevenlabs")}
							className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
								voiceTab === "elevenlabs"
									? "bg-purple-600 text-white shadow"
									: "text-slate-400 hover:text-white"
							}`}
						>
							ElevenLabs AI
						</button>
						<button
							type="button"
							onClick={() => setVoiceTab("manual")}
							className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
								voiceTab === "manual"
									? "bg-rose-600 text-white shadow"
									: "text-slate-400 hover:text-white"
							}`}
						>
							🎙️ Record Mic (Free)
						</button>
					</div>
				</div>

				{voiceTab === "elevenlabs" ? (
					<div className="flex flex-col gap-2.5 text-xs">
						<div className="flex items-center gap-2">
							<Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
							<input
								type="password"
								placeholder="Paste ElevenLabs API Key..."
								value={elevenApiKey}
								onChange={(e) => setElevenApiKey(e.target.value)}
								className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:border-purple-500 focus:outline-none"
							/>
						</div>

						<div className="flex items-center gap-2">
							<select
								value={elevenVoiceId}
								onChange={(e) => setElevenVoiceId(e.target.value)}
								className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg p-2"
							>
								{elevenVoices.map((v) => (
									<option key={v.id} value={v.id}>
										{v.name}
									</option>
								))}
							</select>

							<button
								type="button"
								onClick={handleGenerateElevenLabs}
								disabled={isGeneratingVoice}
								className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-lg flex items-center gap-1.5 transition-all shadow shrink-0"
							>
								<Bot className="w-3.5 h-3.5" />
								{isGeneratingVoice
									? "Creating Voice..."
									: "Generate ElevenLabs Voice"}
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
						<p className="text-[11px] text-slate-400 text-center">
							Click Start to speak your commentary. It will be synced cleanly
							onto the video without any API keys.
						</p>
						<div className="flex items-center gap-3">
							{!isRecording ? (
								<button
									type="button"
									onClick={startRecording}
									className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-all shadow"
								>
									<Radio className="w-4 h-4 animate-pulse" />
									Start Mic Recording
								</button>
							) : (
								<button
									type="button"
									onClick={stopRecording}
									className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/50 text-xs font-semibold rounded-full flex items-center gap-2 transition-all shadow"
								>
									<Square className="w-4 h-4 fill-current" />
									Stop & Save Recording
								</button>
							)}
						</div>
					</div>
				)}

				{/* Active Voiceover Status Bar */}
				{voiceoverFileName && (
					<div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-xs">
						<div className="flex items-center gap-2 text-emerald-300">
							<CheckCircle2 className="w-4 h-4 text-emerald-400" />
							<span className="font-medium">Voiceover Ready:</span>
							<span className="font-mono text-[11px] text-slate-300">
								{voiceoverFileName}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-slate-400 text-[11px]">Vol:</span>
							<input
								type="range"
								min={0.5}
								max={2.0}
								step={0.1}
								value={voiceoverVolume}
								onChange={(e) =>
									setVoiceoverVolume(Number.parseFloat(e.target.value))
								}
								className="w-16 accent-emerald-500 h-1 bg-slate-800 rounded"
							/>
							<span className="text-emerald-400 font-mono text-[11px]">
								{voiceoverVolume}x
							</span>
						</div>
					</div>
				)}
			</div>

			{/* 4. BACKGROUND MUSIC (BGM) SECTION */}
			<div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
				<div className="flex items-center justify-between text-xs font-semibold text-slate-300">
					<div className="flex items-center gap-1.5">
						<Music className="w-4 h-4 text-blue-400" />
						<span>Background Music (BGM - Looped Under Voice)</span>
					</div>
					<button
						type="button"
						onClick={() => setBgmEnabled(!bgmEnabled)}
						className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
							bgmEnabled
								? "bg-blue-500/20 border-blue-500/50 text-blue-400"
								: "bg-slate-800 border-slate-700 text-slate-500"
						}`}
					>
						{bgmEnabled ? "BGM Active" : "BGM Muted"}
					</button>
				</div>

				<div className="grid grid-cols-2 gap-3 text-xs">
					{/* BGM Selector */}
					<div className="flex flex-col gap-1.5">
						<label className="text-[11px] text-slate-400">
							Select BGM Track:
						</label>
						<select
							value={bgmTrackName}
							onChange={(e) => setBgmTrackName(e.target.value)}
							disabled={!bgmEnabled}
							className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-2 disabled:opacity-50 text-xs"
						>
							{bgms.length > 0 ? (
								bgms.map((b) => (
									<option key={b.name} value={b.name}>
										{b.name}
									</option>
								))
							) : (
								<>
									<option value="bg1.mp4">bg1.mp4</option>
									<option value="bg2.mp4">bg2.mp4</option>
									<option value="bg3.mp4">bg3.mp4</option>
									<option value="bg4.mp4">bg4.mp4</option>
								</>
							)}
						</select>
					</div>

					{/* BGM Volume */}
					<div className="flex flex-col gap-1.5">
						<div className="flex justify-between text-[11px] text-slate-400">
							<span>BGM Volume:</span>
							<span className="font-mono text-blue-400">
								{(bgmVolume * 100).toFixed(0)}%
							</span>
						</div>
						<input
							type="range"
							min={0.05}
							max={0.8}
							step={0.05}
							disabled={!bgmEnabled}
							value={bgmVolume}
							onChange={(e) =>
								setBgmVolume(Number.parseFloat(e.target.value))
							}
							className="accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer disabled:opacity-50 mt-2"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
