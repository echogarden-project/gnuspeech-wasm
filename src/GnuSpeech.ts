import { readdir, readFile, writeFile } from 'fs/promises'
import { wrapEmscriptenModuleHeap } from 'wasm-heap-manager'

export async function synthesize(text: string, options: GnuSpeechOptions) {
	options = { ...defaultGnuSpeechOptions, ...options }

	const m = await getWasmModule()

	const manager = wrapEmscriptenModuleHeap(m)

	const dataPath = 'data/en'

	const filesInDataDir = await readdir(dataPath)

	for (const fileName of filesInDataDir) {
		let fileContent = await readFile(`${dataPath}/${fileName}`, 'utf-8')

		if (fileName == 'trm_control_model.txt') {
			fileContent = fileContent.replace('voice_name = male', `voice_name = ${options.voice}`)
			fileContent = fileContent.replace('tempo = 1.0', `tempo = ${options.tempo}`)
			fileContent = fileContent.replace('control_rate = 250.0', `control_rate = ${options.controlRate}`)
		}

		m.FS.writeFile(fileName, fileContent)
	}

	const textRef = manager.allocNullTerminatedUtf8String(text)
	const outputFilePath = manager.allocNullTerminatedUtf8String('./out.wav')
	const configDirPathRef = manager.allocNullTerminatedUtf8String('./')
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
