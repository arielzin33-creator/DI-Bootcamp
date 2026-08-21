/**
 * Typed versions of the react-redux hooks.
 *
 * Using these instead of the raw hooks means `useAppSelector` knows the shape of the
 * whole state, and `useAppDispatch` knows how to dispatch thunks -- so a typo in a
 * state path is a compile error rather than `undefined` at runtime.
 */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
