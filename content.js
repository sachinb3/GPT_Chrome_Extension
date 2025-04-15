let explainBtn = null;

function showSidebar(selectedText, outputHTML, action) {
    const existing = document.getElementById("chatgpt-sidebar");
    if (existing) existing.remove();
  
    const sidebar = document.createElement("div");
    sidebar.id = "chatgpt-sidebar";
  
    sidebar.innerHTML = `
      <div style="margin-bottom: 16px; font-weight: 600; font-size: 18px; color: #202123;">
        ${action === "summarize" ? "📝 Summary" : "🔍 Explanation"}
      </div>
  
      <div style="
        background: #e3e3e3;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 16px;
        font-style: italic;
        color: #444;
        font-size: 14.5px;
      ">
        “${selectedText}”
      </div>
  
      <div style="
        background: #f0f0f0;
        border-radius: 10px;
        padding: 14px 16px;
        line-height: 1.65;
        font-size: 15px;
        color: #202123;
      ">
        ${outputHTML}
      </div>
  
      <button style="
        margin-top: 24px;
        padding: 6px 12px;
        background-color: #10a37f;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;">
        Close
      </button>
    `;
  
    Object.assign(sidebar.style, {
      position: "fixed",
      top: "0",
      right: "0",
      width: "420px",
      minWidth: "300px",
      maxWidth: "90vw",
      height: "100%",
      background: "#f7f7f8",
      borderLeft: "1px solid #ccc",
      boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
      zIndex: 99999,
      padding: "24px",
      overflowY: "auto",
      resize: "horizontal",
      overflow: "auto",
      fontFamily: `"Inter", system-ui, sans-serif`,
    });

    sidebar.style.borderLeft = "4px solid #ccc";
  
    // Close button
    sidebar.querySelector("button").onclick = () => sidebar.remove();
  
    document.body.appendChild(sidebar);
  }
  
  


  function callOpenAI(text, action) {
    // Show loading UI immediately
    showSidebar(text, "⏳ Thinking...", action);
  
    // Get your OpenAI key from storage
    chrome.storage.local.get("openaiKey", async ({ openaiKey }) => {
      if (!openaiKey || !openaiKey.startsWith("sk-")) {
        console.warn("[GPT EXTENSION] Invalid or missing OpenAI API key.");
        const body = document.querySelector("#chatgpt-sidebar .chatgpt-body");
        if (body) {
          body.innerHTML = "❌ No API key found. Please set it in the extension popup.";
        }
        return;
      }
  
      const prompt = action === "summarize"
        ? `Summarize the following:\n\n"${text}"`
        : `Explain the following as if I am 16 years old:\n\n"${text}"`;
  
      console.log("[GPT EXTENSION] Sending request to OpenAI...");
      console.log("Prompt:", prompt);
  
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
          })
        });
  
        const data = await res.json();
        console.log("Raw OpenAI response:", data);
  
        if (!data.choices || !data.choices[0]?.message?.content) {
          throw new Error("Invalid response from OpenAI");
        }
  
        const output = data.choices[0].message.content;
        const html = output
          .replace(/\n/g, "<br>")
          .replace(/`([^`]+)`/g, "<code style='background:#eaeaea;padding:2px 4px;border-radius:4px;'>$1</code>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
        const body = document.querySelector("#chatgpt-sidebar .chatgpt-body");
        if (body) {
          body.innerHTML = html;
        } else {
          console.warn("[GPT EXTENSION] Sidebar not found to update output.");
          showSidebar(text, html, action); // fallback
        }
      } catch (err) {
        console.error("[GPT EXTENSION] OpenAI request failed", err);
  
        const body = document.querySelector("#chatgpt-sidebar .chatgpt-body");
        if (body) {
          body.innerHTML = "❌ Failed to fetch explanation. Please check your API key, internet, or OpenAI account.";
        }
  
        // Optional fallback:
        // alert("❌ Could not connect to OpenAI. See console for more details.");
      }
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarize" || message.action === "explain") {
      callOpenAI(message.text, message.action);
    }
  });
  

function showExplainButtons(selectedText, { left, top }) {
    if (explainBtn) {
      explainBtn.remove();
      explainBtn = null;
    }
  
    explainBtn = document.createElement("div");
    explainBtn.style.position = "absolute";
    explainBtn.style.top = `${top}px`;
    explainBtn.style.left = `${left}px`;
    explainBtn.style.display = "flex";
    explainBtn.style.gap = "6px";
    explainBtn.style.zIndex = 99999;

  const createButton = (emoji, tooltip, action) => {
    const btn = document.createElement("div");
    btn.textContent = emoji;
    btn.title = tooltip;
    btn.style.width = "36px";
    btn.style.height = "36px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.background = "#ffffff";
    btn.style.border = "1px solid #ccc";
    btn.style.borderRadius = "50%";
    btn.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.15)";
    btn.style.cursor = "pointer";
    btn.style.userSelect = "none";
    btn.style.fontSize = "18px";
    btn.style.transition = "filter 0.2s";
  
    btn.addEventListener("mouseenter", () => {
      btn.style.filter = "brightness(0.9)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.filter = "none";
    });
  
    btn.addEventListener("click", () => {
      // Replace emoji with loading spinner
      btn.textContent = "⏳";
      btn.title = "Loading...";
  
      (async () => {
        await callOpenAI(selectedText, action);
        if (explainBtn) {
          explainBtn.remove();
          explainBtn = null;
        }
      })();
    });
  
    return btn;
  };
  

  explainBtn.appendChild(createButton("🔍", "Explain with ChatGPT", "explain"));
  explainBtn.appendChild(createButton("📝", "Summarize with ChatGPT", "summarize"));
  document.body.appendChild(explainBtn);
}

function handleSelection(event) {
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
  
      if (!selectedText) {
        if (explainBtn) {
          explainBtn.remove();
          explainBtn = null;
        }
        return;
      }
  
      // Use mouse position instead of DOM rect
      const mouseX = event.pageX;
      const mouseY = event.pageY + 10; // slight offset below

      chrome.storage.local.get("inlineButtonsEnabled", (res) => {
        const isEnabled = res.inlineButtonsEnabled !== false; // default true
        if (!isEnabled) return;
      
        showExplainButtons(selectedText, { left: event.pageX, top: event.pageY + 10 });
      });
        
      showExplainButtons(selectedText, { left: mouseX, top: mouseY });
    }, 10);
  }
  
function setupListeners() {
  document.removeEventListener("mouseup", handleSelection);
  document.removeEventListener("keyup", handleSelection);
  document.addEventListener("mouseup", handleSelection);
  document.addEventListener("keyup", handleSelection);
}

setupListeners();

const observer = new MutationObserver(setupListeners);
observer.observe(document.body, { childList: true, subtree: true });
