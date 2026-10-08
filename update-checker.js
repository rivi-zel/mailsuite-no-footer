/* Unofficial build update notifier. No automatic downloads or installation. */
(() => {
  "use strict";
  const REPO = "https://github.com/rivi-zel/mailsuite-no-footer";
  const VERSION_URL = "https://raw.githubusercontent.com/rivi-zel/mailsuite-no-footer/main/version.json";
  const ALARM = "mailsuite-no-footer-update-check";
  const NOTICE = "mailsuite-no-footer-update";
  const STATE = "mailsuiteNoFooterUpdateState";
  const DAY = 24 * 60 * 60 * 1000;
  let checking = false;

  function parts(version) {
    if (typeof version !== "string" || !/^\d+(\.\d+){0,3}$/.test(version)) return null;
    const values = version.split(".").map(Number);
    return values.every(Number.isSafeInteger) ? values : null;
  }
  function newer(candidate, installed) {
    const a = parts(candidate), b = parts(installed);
    if (!a || !b) return false;
    for (let i = 0; i < 4; i++) {
      if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
    }
    return false;
  }
  async function check() {
    if (checking) return;
    checking = true;
    let timer;
    try {
      const stored = await chrome.storage.local.get(STATE);
      const state = stored[STATE] || {};
      const now = Date.now();
      if (state.checkedAt && now >= state.checkedAt && now - state.checkedAt < DAY) return;
      await chrome.storage.local.set({ [STATE]: { ...state, checkedAt: now } });
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(VERSION_URL, {
        cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
        signal: controller.signal
      });
      if (!response.ok) return; // Private repos, offline and errors stay silent.
      const text = await response.text();
      if (text.length > 32768) return;
      const release = JSON.parse(text);
      const installed = chrome.runtime.getManifest().version;
      if (!newer(release.version, installed)) {
        await chrome.notifications.clear(NOTICE);
        return;
      }
      if (state.notifiedVersion === release.version) return;
      const notes = typeof release.notes === "string" ? release.notes.replace(/[\r\n\t]+/g, " ").slice(0, 180) : "";
      await chrome.notifications.create(NOTICE, {
        type: "basic", iconUrl: chrome.runtime.getURL("images/icon-128.png"),
        title: "Mailsuite patched build update",
        message: `Version ${release.version} is available (installed: ${installed}). ${notes || "Click to open the repository and install the new build."}`,
        priority: 1
      });
      await chrome.storage.local.set({ [STATE]: { checkedAt: now, notifiedVersion: release.version } });
    } catch (_) {
      // No notifications or console noise for failed update checks.
    } finally {
      clearTimeout(timer);
      checking = false;
    }
  }
  async function ensureAlarm() {
    try {
      if (!await chrome.alarms.get(ALARM)) {
        await chrome.alarms.create(ALARM, { delayInMinutes: 1, periodInMinutes: 1440 });
      }
    } catch (_) {}
  }
  chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) void check(); });
  chrome.runtime.onInstalled.addListener(() => { void ensureAlarm(); void check(); });
  chrome.runtime.onStartup.addListener(() => { void ensureAlarm(); void check(); });
  chrome.notifications.onClicked.addListener(id => {
    if (id === NOTICE) {
      void chrome.tabs.create({ url: REPO }).catch(() => {});
      void chrome.notifications.clear(NOTICE).catch(() => {});
    }
  });
  void ensureAlarm();
})();
