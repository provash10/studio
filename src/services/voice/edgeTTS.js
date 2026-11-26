import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Free Edge-TTS synthesis using Microsoft Neural Voices (Edge-TTS).
 * Zero cost, unlimited, no API key required.
 */
export async function synthesizeEdgeTTS({
	text,
	voice = "bn-BD-PradeepNeural",
	rate = 1.0,
	outputPath,
}) {
	return new Promise((resolve, reject) => {
		if (!text || !text.trim()) {
			return reject(new Error("Text is required for Edge-TTS"));
		}

		// Rate formatting for edge-tts CLI (e.g. "+0%", "+20%", "-10%")
		const percent = Math.round((rate - 1.0) * 100);
		const rateArg = percent >= 0 ? `+${percent}%` : `${percent}%`;

		// Try global edge-tts or Python script
		const args = [
			"--voice",
			voice,
			"--text",
			text,
			"--rate",
			rateArg,
			"--write-media",
			outputPath,
		];

		const child = spawn("edge-tts", args, { shell: true });
		let stderr = "";

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
				resolve({
					success: true,
					provider: "edge-tts",
					voice,
					outputPath,
				});
			} else {
				// Fallback: try python -m edge_tts
				const pyChild = spawn(
					"python",
					["-m", "edge_tts", ...args],
					{ shell: true }
				);
				let pyStderr = "";
				pyChild.stderr.on("data", (d) => {
					pyStderr += d.toString();
				});
				pyChild.on("close", (pyCode) => {
					if (
						pyCode === 0 &&
						fs.existsSync(outputPath) &&
						fs.statSync(outputPath).size > 0
					) {
						resolve({
							success: true,
							provider: "edge-tts",
							voice,
							outputPath,
						});
					} else {
						reject(new Error(`Edge-TTS failed: ${stderr || pyStderr || "Unknown error"}`));
					}
				});
			}
		});

		child.on("error", (err) => {
			reject(err);
		});
	});
}
