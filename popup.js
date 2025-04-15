document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("apiKey");
  const button = document.getElementById("saveKeyBtn");
  const status = document.getElementById("saveStatus");

  // Load saved key (but don’t show it in the input)
  chrome.storage.local.get("openaiKey", (result) => {
    if (result.openaiKey) {
      input.style.display = "none";
      button.style.display = "none";
      status.style.display = "block";
    }
  });

  

  button.addEventListener("click", () => {
    const key = input.value.trim();
    if (!key.startsWith("sk-")) {
      alert("❌ Please enter a valid OpenAI API key.");
      return;
    }

    chrome.storage.local.set({ openaiKey: key }, () => {
      input.style.display = "none";
      button.style.display = "none";
      status.style.display = "block";
    });
  });

  
});

