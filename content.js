let lastText = "";

document.addEventListener("mouseup", () => {
  setTimeout(() => {
    try {
      const selection = window.getSelection();
      if (!selection) return;
      
      const text = selection.toString().trim();
      
      // Basic validation: must be a real word/short phrase, not just numbers
      if (text && text !== lastText && text.length > 1 && text.split(/\s+/).length <= 6 && !/^\d+$/.test(text)) {
        lastText = text;
        
        chrome.runtime.sendMessage({
          action: "forwardToSidePanel",
          text: text
        }).catch(() => {
          // It's perfectly fine if this fails (e.g. side panel is closed)
        });
      }
    } catch (e) {
      // In strictly isolated frames (like native PDF viewer sometimes), getSelection might throw or be null.
      // That's why we have the Context Menu fail-safe.
    }
  }, 10);
});
