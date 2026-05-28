import type { AxiosError } from "axios";
import { appErrorMetaMap, type AppErrorType } from "./app-errors";

export const API_ERROR = {
  HTTP: "HTTP_ERROR",
  NETWORK: "NETWORK_ERROR",
  UNEXPECTED: "UNEXPECTED_ERROR",
} as const;

export interface HttpErrorType {
  type: (typeof API_ERROR)["HTTP"];
  status: number;
  statusText: string;
  data: unknown;
  message: string;
  cause: AxiosError;
}

export interface NetworkErrorType {
  type: (typeof API_ERROR)["NETWORK"];
  message: string;
  cause: AxiosError;
}

export interface UnexpectedErrorType {
  type: (typeof API_ERROR)["UNEXPECTED"];
  message: string;
  cause: AxiosError;
}

export type ApiError = HttpErrorType | NetworkErrorType | UnexpectedErrorType;

export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === "object" && error !== null && "type" in error && "message" in error;
};

export type AppErrorMeta = {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
};

export class AppError extends Error {
  type: AppErrorType;
  meta: AppErrorMeta;
  cause?: ApiError | unknown;

  constructor(type: AppErrorType, cause?: ApiError | unknown) {
    super(appErrorMetaMap[type].title);
    this.name = "AppError";
    this.type = type;
    this.meta = appErrorMetaMap[type];
    this.cause = cause;
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
