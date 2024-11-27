import { writeFile } from 'fs/promises'

import { synthesize } from "./GnuSpeech.js";

const result = await synthesize('Hello World! How are you doing today?', {
	voice: 'male',
	controlRate: 200,
	tempo: 0.6,
})

await writeFile('out/out.wav', result.audioData)
await writeFile('out/out-params.txt', result.params)
