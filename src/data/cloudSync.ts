import { apiEndpoint } from "@/data/apiEndpoint";
import { validateLocalBackupData } from "@/domain/backup";
import type { LocalBackupData } from "@/domain/backup";
import { isSafeRevision } from "@/domain/sync";

export type CloudSnapshot = {
  data: LocalBackupData | null;
  revision: number;
  updatedAt: string | null;
};

export type GetToken = () => Promise<string | null>;

export class CloudSyncError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CloudSyncError";
  }
}

async function authorizedRequest(getToken: GetToken, init: RequestInit): Promise<Response> {
  const token = await getToken();
  if (!token) throw new CloudSyncError("登入狀態已失效，請重新登入。", 401);

  let response: Response;
  try {
    response = await fetch(apiEndpoint("/api/sync"), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new CloudSyncError("無法連上雲端，請確認網路後再試一次。", 0);
  }

  if (!response.ok) {
    const fallback = response.status === 409
      ? "雲端資料已在其他裝置更新，請重新整理後再決定。"
      : response.status === 401
        ? "登入狀態已失效，請重新登入。"
        : "雲端同步暫時無法完成，請稍後再試。";
    throw new CloudSyncError(fallback, response.status);
  }
  return response;
}

function parseSnapshot(value: unknown): CloudSnapshot {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CloudSyncError("雲端回傳的資料格式不正確。", 502);
  }
  const record = value as Record<string, unknown>;
  if (!isSafeRevision(record.revision)) {
    throw new CloudSyncError("雲端版本資料不正確。", 502);
  }
  if (record.updatedAt !== null && typeof record.updatedAt !== "string") {
    throw new CloudSyncError("雲端更新時間不正確。", 502);
  }
  return {
    data: record.data === null ? null : validateLocalBackupData(record.data),
    revision: record.revision as number,
    updatedAt: record.updatedAt as string | null,
  };
}

export async function getCloudSnapshot(getToken: GetToken): Promise<CloudSnapshot> {
  const response = await authorizedRequest(getToken, { method: "GET" });
  return parseSnapshot(await response.json());
}

export async function putCloudSnapshot(
  getToken: GetToken,
  data: LocalBackupData,
  expectedRevision: number,
): Promise<CloudSnapshot> {
  if (!isSafeRevision(expectedRevision)) {
    throw new CloudSyncError("雲端版本資料不正確。", 400);
  }
  const response = await authorizedRequest(getToken, {
    method: "PUT",
    body: JSON.stringify({ data, expectedRevision }),
  });
  return parseSnapshot(await response.json());
}

export async function deleteCloudSnapshot(getToken: GetToken): Promise<void> {
  await authorizedRequest(getToken, { method: "DELETE" });
}
