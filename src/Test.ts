import { synthesize } from './GnuSpeech.js'

async function test() {
	const result = await synthesize('Hello World! How are you doing today?', {
		voice: 'male',
		controlRate: 200,
		tempo: 0.6,
	})

	const { writeFile } = await import('fs/promises')

	await writeFile('out/out.wav', result.audioData)
	await writeFile('out/out-params.txt', result.params)
}

test()
