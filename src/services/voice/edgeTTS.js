import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * Free Edge-TTS synthesis using Microsoft Neural Voices (Edge-TTS).
 * Zero cost, unlimited, no API key required.
 */
export async function synthesizeEdgeTTS({
	text,
	voice = "en-US-ChristopherNeural",
	rate = 1.0,
	outputPath,
}) {
	if (!text || !text.trim()) {
		throw new Error("Text is required for Edge-TTS");
	}

	// Rate formatting for edge-tts CLI (e.g. "+0%", "+20%", "-10%")
	const percent = Math.round((rate - 1.0) * 100);
	const rateArg = percent >= 0 ? `+${percent}%` : `${percent}%`;

	// Write text to a temporary UTF-8 file to avoid Windows command-line quoting/escaping issues
	const tempDir = os.tmpdir();
	const tempTextPath = path.join(
		tempDir,
		`edge_tts_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.txt`
	);

	await fs.promises.writeFile(tempTextPath, text.trim(), "utf-8");

	const cleanupTemp = async () => {
		try {
			await fs.promises.unlink(tempTextPath);
		} catch {}
	};

	const args = [
		"--voice",
		voice,
		"--file",
		tempTextPath,
		"--rate",
		rateArg,
		"--write-media",
		outputPath,
	];

	return new Promise((resolve, reject) => {
		// Try global edge-tts first
		const child = spawn("edge-tts", args, { shell: true });
		let stderr = "";

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", async (code) => {
			if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
				await cleanupTemp();
				return resolve({
					success: true,
					provider: "edge-tts",
					voice,
					outputPath,
				});
			}

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
			pyChild.on("close", async (pyCode) => {
				await cleanupTemp();
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
			pyChild.on("error", async (pyErr) => {
				await cleanupTemp();
				reject(pyErr);
			});
		});

		child.on("error", async (err) => {
			// Fallback if edge-tts CLI binary is not in PATH directly
			const pyChild = spawn(
				"python",
				["-m", "edge_tts", ...args],
				{ shell: true }
			);
			let pyStderr = "";
			pyChild.stderr.on("data", (d) => {
				pyStderr += d.toString();
			});
			pyChild.on("close", async (pyCode) => {
				await cleanupTemp();
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
					reject(new Error(`Edge-TTS failed: ${pyStderr || err.message}`));
				}
			});
			pyChild.on("error", async () => {
				await cleanupTemp();
				reject(err);
			});
		});
	});
}
