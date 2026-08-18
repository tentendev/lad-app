import AsyncStorage from "@react-native-async-storage/async-storage";

import { parseStored, STORAGE_PREFIX, type StorageRepository } from "./storage.types";

export const storage: StorageRepository = {
  async get<T>(key: string, fallback: T): Promise<T> {
    return parseStored(await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`), fallback);
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },
  async getRaw(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
  },
  async setRaw(key: string, value: string | null): Promise<void> {
    if (value === null) await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    else await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  },
};
