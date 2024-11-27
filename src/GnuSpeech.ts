import { wrapEmscriptenModuleHeap } from 'wasm-heap-manager'
import { defaultTrmControlModelFileContent } from './DefaultTrmControlModel.js'

export async function synthesize(text: string, options: GnuSpeechOptions) {
	options = { ...defaultGnuSpeechOptions, ...options }

	let modifiedConfigFileContent = defaultTrmControlModelFileContent

	modifiedConfigFileContent = modifiedConfigFileContent.replace('voice_name = male', `voice_name = ${options.voice}`)
	modifiedConfigFileContent = modifiedConfigFileContent.replace('tempo = 1.0', `tempo = ${options.tempo}`)
	modifiedConfigFileContent = modifiedConfigFileContent.replace('control_rate = 250.0', `control_rate = ${options.controlRate}`)

	const m = await getWasmModule()

	const dataPath = '/data/en'
	m.FS.writeFile(`${dataPath}/trm_control_model.txt`, modifiedConfigFileContent)

	const manager = wrapEmscriptenModuleHeap(m)

	const textRef = manager.allocNullTerminatedUtf8String(text)
	const outputFilePath = manager.allocNullTerminatedUtf8String('./out.wav')
	const configDirPathRef = manager.allocNullTerminatedUtf8String(dataPath)
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
