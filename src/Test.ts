import { synthesize } from "./GnuSpeech.js";

synthesize('Hello World! How are you doing today?', {
	voice: 'male',
	controlRate: 200,
	tempo: 0.6,
})
