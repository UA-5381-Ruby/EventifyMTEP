import '@testing-library/jest-dom';
// @ts-expect-error Node.js 'util' module types conflict with frontend tsconfig DOM types
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util';

Object.defineProperties(globalThis, {
  TextEncoder: { value: NodeTextEncoder, writable: true },
  TextDecoder: { value: NodeTextDecoder, writable: true },
});
