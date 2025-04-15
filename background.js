chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainWithChatGPT",
    title: "🔍 Explain with ChatGPT",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "summarizeWithChatGPT",
    title: "📝 Summarize with ChatGPT",
    contexts: ["selection"]
  });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText || !tab.id) return;

  chrome.tabs.sendMessage(tab.id, {
    action: info.menuItemId === "summarizeWithChatGPT" ? "summarize" : "explain",
    text: info.selectionText
  });
});

