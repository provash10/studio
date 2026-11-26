import { spawn } from "child_process";
import fs from "fs";

/**
 * Local Windows System.Speech offline voice synthesis fallback.
 */
export async function synthesizeSystemTTS({
	text,
	outputPath,
}) {
	return new Promise((resolve, reject) => {
		const escapedText = text.replace(/"/g, '""');
		const psScript = `
Add-Type -AssemblyName System.Speech;
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
$synth.SetOutputToWaveFile('${outputPath.replace(/'/g, "''")}');
$synth.Speak("${escapedText}");
$synth.Dispose();
`;
		const child = spawn(
			"powershell.exe",
			["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript],
			{ shell: true }
		);

		let stderr = "";
		child.stderr.on("data", (d) => {
			stderr += d.toString();
		});

		child.on("close", (code) => {
			if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
				resolve({
					success: true,
					provider: "system-tts",
					outputPath,
				});
			} else {
				reject(new Error(`System TTS failed: ${stderr || "Code " + code}`));
			}
		});

		child.on("error", (err) => {
			reject(err);
		});
	});
}
