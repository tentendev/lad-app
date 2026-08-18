import { parseStored, STORAGE_PREFIX, type StorageRepository } from "./storage.types";

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export const storage: StorageRepository = {
  async get<T>(key: string, fallback: T): Promise<T> {
    return parseStored(browserStorage()?.getItem(`${STORAGE_PREFIX}${key}`) ?? null, fallback);
  },
  async set<T>(key: string, value: T): Promise<void> {
    browserStorage()?.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    browserStorage()?.removeItem(`${STORAGE_PREFIX}${key}`);
  },
  async getRaw(key: string): Promise<string | null> {
    return browserStorage()?.getItem(`${STORAGE_PREFIX}${key}`) ?? null;
  },
  async setRaw(key: string, value: string | null): Promise<void> {
    if (value === null) browserStorage()?.removeItem(`${STORAGE_PREFIX}${key}`);
    else browserStorage()?.setItem(`${STORAGE_PREFIX}${key}`, value);
  },
};
