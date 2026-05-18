import '@testing-library/jest-dom';
// @ts-ignore
import { TextEncoder, TextDecoder } from 'util';

Object.assign(globalThis, { TextEncoder, TextDecoder });