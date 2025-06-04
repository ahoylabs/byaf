// test/setup.ts
import FileReader from 'filereader' // polyfill package

// expose it so production code sees it
globalThis.FileReader = FileReader as unknown as typeof window.FileReader
