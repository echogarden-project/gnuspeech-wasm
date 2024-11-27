# GnuSpeech (WebAssembly port)

WebAssembly port of the [`GnuSpeech articulatory speech synthesizer`](https://github.com/mym-br/gnuspeech_sa).

## Installation

```
npm install @echogarden/gnuspeech-wasm
```

## Usage example

```ts
import { synthesize } from '@echogarden/gnuspeech-wasm'

await synthesize('Hello World!', {
	voice: 'male',
	controlRate: 250,
	tempo: 1.0,
})
```



## License
MIT
