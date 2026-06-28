import { useCallback, useEffect, useId, useRef, type Dispatch, type SetStateAction } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { clearReduxState, setReduxState } from '@/component-state-slice';
import type { AppDispatch, RootState } from '@/store';

type InitialState<T> = T | (() => T);

function resolveInitialState<T>(initialState: InitialState<T>): T {
  return typeof initialState === 'function' ? (initialState as () => T)() : initialState;
}

export function useReduxState<T>(initialState: InitialState<T>): [T, Dispatch<SetStateAction<T>>] {
  const key = useId();
  const initialValueRef = useRef<T | null>(null);
  const hasInitialValueRef = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  if (!hasInitialValueRef.current) {
    initialValueRef.current = resolveInitialState(initialState);
    hasInitialValueRef.current = true;
  }

  const value = useSelector((state: RootState) =>
    Object.prototype.hasOwnProperty.call(state.componentState.values, key)
      ? (state.componentState.values[key] as T)
      : (initialValueRef.current as T)
  );

  const setState = useCallback<Dispatch<SetStateAction<T>>>(
    (nextState) => {
      const values = store.getState().componentState.values;
      const previousState = Object.prototype.hasOwnProperty.call(values, key)
        ? (values[key] as T)
        : (initialValueRef.current as T);
      const valueToStore =
        typeof nextState === 'function'
          ? (nextState as (previousState: T) => T)(previousState)
          : nextState;

      dispatch(setReduxState({ key, value: valueToStore }));
    },
    [dispatch, key, store]
  );

  useEffect(() => {
    return () => {
      dispatch(clearReduxState(key));
    };
  }, [dispatch, key]);

  return [value, setState];
}
