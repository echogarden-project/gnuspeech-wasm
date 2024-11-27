import { wrapEmscriptenModuleHeap } from 'wasm-heap-manager'
import { decodeUtf8, encodeUtf8 } from './utilities/Utf8.js'

export async function synthesize(text: string, options: GnuSpeechOptions) {
	options = { ...defaultGnuSpeechOptions, ...options }

	const m = await getWasmModule()

	const manager = wrapEmscriptenModuleHeap(m)

	{
		const configFilePath = '/data/en/trm_control_model.txt'

		let fileContent = decodeUtf8(m.FS.readFile(configFilePath))

		fileContent = fileContent.replace('voice_name = male', `voice_name = ${options.voice}`)
		fileContent = fileContent.replace('tempo = 1.0', `tempo = ${options.tempo}`)
		fileContent = fileContent.replace('control_rate = 250.0', `control_rate = ${options.controlRate}`)
		
		m.FS.writeFile(configFilePath, encodeUtf8(fileContent))
	}

	const textRef = manager.allocNullTerminatedUtf8String(text)
	const outputFilePath = manager.allocNullTerminatedUtf8String('./out.wav')
	const configDirPathRef = manager.allocNullTerminatedUtf8String('/data/en')
	const trmParamFilePathRef = manager.allocNullTerminatedUtf8String('./out-params.txt')

	m._GnuSpeech_synthesizeToFile(textRef.address, outputFilePath.address, configDirPathRef.address, trmParamFilePathRef.address, options.debug)

	const outputFileContent = m.FS.readFile(outputFilePath.value)
	const outputParamsFileContent = m.FS.readFile(trmParamFilePathRef.value)

	textRef.free()
	outputFilePath.free()
	configDirPathRef.free()
	trmParamFilePathRef.free()

	return {
		audioData: outputFileContent,
		params: outputParamsFileContent
	}
}

let wasmModule: any

async function getWasmModule() {
	if (wasmModule) {
		return wasmModule
	}

	const { default: initializer } = await import('../wasm/gnuspeech.js')

	wasmModule = await initializer()

	return wasmModule
}

export type GnuSpeechVoiceName = 'male' | 'female' | 'large_child' | 'small_child' | 'baby'

export const defaultGnuSpeechOptions: GnuSpeechOptions = {
	voice: 'male',
	tempo: 1.0,
	controlRate: 250.0,

	debug: false,
}

export interface GnuSpeechOptions {
	voice?: GnuSpeechVoiceName
	tempo?: number
	controlRate?: number

	debug?: boolean
}
