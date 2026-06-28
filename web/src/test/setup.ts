import '@testing-library/jest-dom';
// @ts-expect-error Node.js 'util' module types conflict with frontend tsconfig DOM types
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util';

jest.mock('@testing-library/react', () => {
  const actual = jest.requireActual('@testing-library/react');
  const React = jest.requireActual('react');
  const { Provider } = jest.requireActual('react-redux');
  const { store } = jest.requireActual('@/store');

  const withReduxProvider = (Wrapper?: React.ComponentType<{ children: React.ReactNode }>) => {
    return function ReduxProviderWrapper({ children }: { children: React.ReactNode }) {
      const wrappedChildren = Wrapper ? React.createElement(Wrapper, null, children) : children;

      return React.createElement(Provider, { store }, wrappedChildren);
    };
  };

  return {
    ...actual,
    render: (ui: React.ReactElement, options: Record<string, unknown> = {}) =>
      actual.render(ui, {
        ...options,
        wrapper: withReduxProvider(
          options.wrapper as React.ComponentType<{ children: React.ReactNode }> | undefined
        ),
      }),
    renderHook: <Result, Props>(
      renderCallback: (initialProps: Props) => Result,
      options: Record<string, unknown> = {}
    ) =>
      actual.renderHook(renderCallback, {
        ...options,
        wrapper: withReduxProvider(
          options.wrapper as React.ComponentType<{ children: React.ReactNode }> | undefined
        ),
      }),
  };
});

Object.defineProperties(globalThis, {
  TextEncoder: { value: NodeTextEncoder, writable: true },
  TextDecoder: { value: NodeTextDecoder, writable: true },
});
