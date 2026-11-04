const api = typeof browser !== "undefined" ? browser : chrome;

// Edge's post-update page: https://explore.microsoft.com/<locale>/edge/update/<version>?...
api.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId !== 0) return; // main frame only

    try {
      // If it's the only tab in the window, open a new tab first
      // so closing it doesn't take the whole window down.
      const tab = await api.tabs.get(details.tabId);
      const siblings = await api.tabs.query({ windowId: tab.windowId });
      if (siblings.length === 1) {
        await api.tabs.create({ windowId: tab.windowId });
      }
      await api.tabs.remove(details.tabId);
    } catch (e) {
      // tab may already be gone
    }
  },
  {
    url: [
      { hostEquals: "explore.microsoft.com", pathContains: "/edge/update/" }
    ]
  }
);