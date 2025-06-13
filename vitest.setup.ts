// test/setup.ts
import FileReader from 'filereader' // polyfill package

// expose it so production code sees it
globalThis.FileReader = FileReader
