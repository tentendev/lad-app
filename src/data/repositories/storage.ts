import { parseStored, type StorageRepository } from "./storage.types";

const memory = new Map<string, string>();

// Used only by non-platform tooling. Metro resolves storage.web.ts or storage.native.ts.
export const storage: StorageRepository = {
  async get<T>(key: string, fallback: T): Promise<T> {
    return parseStored(memory.get(key) ?? null, fallback);
  },
  async set<T>(key: string, value: T): Promise<void> {
    memory.set(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    memory.delete(key);
  },
  async getRaw(key: string): Promise<string | null> {
    return memory.get(key) ?? null;
  },
  async setRaw(key: string, value: string | null): Promise<void> {
    if (value === null) memory.delete(key);
    else memory.set(key, value);
  },
};
