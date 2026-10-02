import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { storage } from "@/data/repositories/storage";
import { SITE_UPDATES } from "@/data/siteUpdates";
import { hasUnreadSiteUpdate, SITE_UPDATES_STORAGE_KEY, type SiteUpdate } from "@/domain/siteUpdates";

type UpdateState = {
  latest: SiteUpdate | undefined;
  ready: boolean;
  unread: boolean;
  visible: boolean;
  open: () => void;
  dismiss: () => void;
  allowAutoOpen: () => void;
};

const Context = createContext<UpdateState | null>(null);

export function SiteUpdatesProvider({ children, deferAutoOpen = false }: PropsWithChildren<{ deferAutoOpen?: boolean }>) {
  const latest = SITE_UPDATES[0];
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(false);
  const [visible, setVisible] = useState(false);
  const [autoOpenAllowed, setAutoOpenAllowed] = useState(!deferAutoOpen);
  const autoOpened = useRef(false);
  const allowAutoOpen = useCallback(() => setAutoOpenAllowed(true), []);

  useEffect(() => {
    let active = true;
    void storage.get<unknown>(SITE_UPDATES_STORAGE_KEY, [])
      .catch(() => [])
      .then(saved => {
        if (!active) return;
        setUnread(hasUnreadSiteUpdate(latest, saved));
        setReady(true);
      });
    return () => { active = false; };
  }, [latest]);

  useEffect(() => {
    if (ready && autoOpenAllowed && unread && !autoOpened.current) {
      autoOpened.current = true;
      setVisible(true);
    }
  }, [ready, autoOpenAllowed, unread]);

  function dismiss() {
    autoOpened.current = true;
    setVisible(false);
    setUnread(false);
    // A blocked preference write must never prevent dismissing a notice.
    if (latest) void storage.set(SITE_UPDATES_STORAGE_KEY, [latest.id]).catch(() => {});
  }

  return <Context.Provider value={{ latest, ready, unread, visible, open: () => setVisible(true), dismiss, allowAutoOpen }}>{children}</Context.Provider>;
}

export function useSiteUpdates(): UpdateState {
  const value = useContext(Context);
  if (!value) throw new Error("Site updates must be inside SiteUpdatesProvider.");
  return value;
}
