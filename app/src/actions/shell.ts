import { ipc } from "@/ipc/manager";

export const openExternalLink = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return;
  } catch { return; }
  ipc.client.shell.openExternalLink({ url });
};
