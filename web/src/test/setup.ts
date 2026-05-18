import '@testing-library/jest-dom';
// @ts-expect-error Node.js 'util' module is missing matching types in frontend TS configuration
import { TextEncoder, TextDecoder } from 'util';

Object.assign(globalThis, { TextEncoder, TextDecoder });