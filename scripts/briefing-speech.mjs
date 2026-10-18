// Pre-render the trail briefing. Reads the elf script (unicorn uses the same
// lines). us-east-1: Matthew neural for the rule (then a 500 ms breath),
// Joanna generative for the on-screen line. Kimberly neural sounds synthetic
// on these short taps, and she has no generative voice. us-east-2 only has
// the standard engine. MP3 at 24 kHz stays small.
// Pass "rule" or "line" to redo one side, and a step number (1–4) to redo one step.
import { execFileSync } from "node:child_process";
import { copy } from "../src/game/themes/elf/theme.js";

const region = "us-east-1";
const rate = "24000";
const outDir = "public/instructions";
const xml = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const only = process.argv[2];
const stepArg = Number(process.argv[3]);

function synthesize(ssml, voice, engine, file) {
  execFileSync(
    "aws",
    [
      "polly",
      "synthesize-speech",
      "--region",
      region,
      "--engine",
      engine,
      "--voice-id",
      voice,
      "--output-format",
      "mp3",
      "--sample-rate",
      rate,
      "--text-type",
      "ssml",
      "--text",
      ssml,
      file,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

for (const [index, { rule, prompt }] of copy.briefing.entries()) {
  const n = index + 1;
  if (stepArg && n !== stepArg) continue;
  if (only !== "line") {
    synthesize(
      `<speak>${xml(rule)}<break time="500ms"/></speak>`,
      "Matthew",
      "neural",
      `${outDir}/${n}-rule.mp3`,
    );
  }
  if (only !== "rule") {
    synthesize(
      `<speak>${xml(prompt)}</speak>`,
      "Joanna",
      "generative",
      `${outDir}/${n}-line.mp3`,
    );
  }
  console.log(n, only === "line" ? prompt : rule);
}
