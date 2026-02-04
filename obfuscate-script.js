import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic import for javascript-obfuscator
const JavaScriptObfuscator = (await import('javascript-obfuscator')).default;

const sourceFile = path.join(__dirname, 'plugins', 'المالك-سكربتي-source.js');
const outputFile = path.join(__dirname, 'plugins', 'المالك-سكربتي.js');

console.log('Reading source file...');
const sourceCode = fs.readFileSync(sourceFile, 'utf8');

console.log('Obfuscating with maximum protection...');
const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 1,
    stringArrayEncoding: ['rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
});

console.log('Writing obfuscated file...');
fs.writeFileSync(outputFile, obfuscationResult.getObfuscatedCode());

const stats = fs.statSync(outputFile);
console.log(`✅ Obfuscation complete!`);
console.log(`📁 Output file: ${outputFile}`);
console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`🔒 Protection level: MAXIMUM`);
console.log(`🎯 Authorized user: 201006741515 (hardcoded and obfuscated)`);
