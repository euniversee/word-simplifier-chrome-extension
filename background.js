chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  chrome.contextMenus.create({
    id: "simplify-side-panel",
    title: 'Simplify "%s"',
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "simplify-side-panel") {
    const sendData = () => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: "analyzeText",
          text: info.selectionText
        }).catch(() => {});
      }, 500);
    };

    const windowId = tab && tab.windowId !== -1 ? tab.windowId : undefined;

    if (windowId !== undefined) {
      chrome.sidePanel.open({ windowId }).then(sendData).catch(sendData);
    } else {
      chrome.windows.getCurrent((win) => {
        if (win && win.id !== -1) {
          chrome.sidePanel.open({ windowId: win.id }).then(sendData).catch(sendData);
        } else {
          sendData();
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "forwardToSidePanel") {
    chrome.runtime.sendMessage({
      action: "analyzeText",
      text: request.text
    }).catch(() => {});
  }
});
