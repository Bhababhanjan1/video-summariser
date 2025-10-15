document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const summarizeBtn = document.getElementById("summarizeBtn");
  const summaryType = document.getElementById("summaryType");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 1️⃣ Detect YouTube video
  if (tab.url.includes("youtube.com/watch")) {
    output.innerHTML = `🎥 Detected video:<br><span style="color:#9ca3af">${tab.url}</span>`;
  } else {
    output.innerHTML = "⚠️ Please open a YouTube video page to summarize.";
  }

  // 2️⃣ When user clicks Summarize
  summarizeBtn.addEventListener("click", async () => {
    if (!tab.url.includes("youtube.com/watch")) {
      output.innerHTML = "🚫 No valid YouTube video detected.";
      return;
    }

    output.innerHTML = "⏳ Fetching transcript...";

    try {
      const videoId = new URL(tab.url).searchParams.get("v");

      // Fetch transcript text
      const transcriptRes = await fetch(
        `https://youtubetranscriptapi.vercel.app/api?videoId=${videoId}`
      );
      const transcriptData = await transcriptRes.json();

      if (!transcriptData.text) {
        output.innerHTML = "❌ Could not fetch transcript for this video.";
        return;
      }

      const transcript = transcriptData.text.slice(0, 4000); // limit for demo

      output.innerHTML = "🧠 Summarizing video with AI...";

      // 3️⃣ Send transcript to OpenAI API
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_OPENAI_API_KEY_HERE`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that summarizes YouTube transcripts.`
            },
            {
              role: "user",
              content: `Summarize this transcript in a ${summaryType.value.toLowerCase()} way:\n\n${transcript}`
            }
          ]
        })
      });

      const data = await openaiRes.json();
      const summary = data.choices?.[0]?.message?.content || "⚠️ No summary generated.";
      output.innerHTML = `<strong>📝 Summary:</strong><br>${summary}`;

    } catch (error) {
      console.error(error);
      output.innerHTML = "⚠️ Error generating summary.";
    }
  });
});


/// new

document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const summarizeBtn = document.getElementById("summarizeBtn");
  const summaryType = document.getElementById("summaryType");
  const apiKeyInput = document.getElementById("apiKey");
  const saveKeyBtn = document.getElementById("saveKeyBtn");

  // Load saved API key (if any)
  chrome.storage.local.get("openai_api_key", (data) => {
    if (data.openai_api_key) {
      apiKeyInput.value = "************"; // hide real key
    }
  });

  // Save key to Chrome storage
  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key.startsWith("sk-")) {
      chrome.storage.local.set({ openai_api_key: key }, () => {
        output.innerHTML = "✅ API key saved successfully!";
        apiKeyInput.value = "************";
      });
    } else {
      output.innerHTML = "⚠️ Invalid API key format.";
    }
  });

  // Detect current tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("youtube.com/watch")) {
    output.innerHTML = `🎥 Detected video:<br><span style="color:#9ca3af">${tab.url}</span>`;
  } else {
    output.innerHTML = "⚠️ Please open a YouTube video page to summarize.";
  }

  summarizeBtn.addEventListener("click", async () => {
    chrome.storage.local.get("openai_api_key", async (data) => {
      const apiKey = data.openai_api_key;

      if (!apiKey) {
        output.innerHTML = "❌ Please save your API key first.";
        return;
      }

      if (!tab.url.includes("youtube.com/watch")) {
        output.innerHTML = "🚫 No valid YouTube video detected.";
        return;
      }

      output.innerHTML = "⏳ Fetching transcript...";

      try {
        const videoId = new URL(tab.url).searchParams.get("v");
        const transcriptRes = await fetch(
          `https://youtubetranscriptapi.vercel.app/api?videoId=${videoId}`
        );
        const transcriptData = await transcriptRes.json();

        if (!transcriptData.text) {
          output.innerHTML = "❌ Could not fetch transcript for this video.";
          return;
        }

        const transcript = transcriptData.text.slice(0, 4000);

        output.innerHTML = "🧠 Summarizing video with AI...";

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a helpful assistant that summarizes YouTube transcripts.`
              },
              {
                role: "user",
                content: `Summarize this transcript in a ${summaryType.value.toLowerCase()} way:\n\n${transcript}`
              }
            ]
          })
        });

        const data = await openaiRes.json();
        const summary = data.choices?.[0]?.message?.content || "⚠️ No summary generated.";
        output.innerHTML = `<strong>📝 Summary:</strong><br>${summary}`;

      } catch (error) {
        console.error(error);
        output.innerHTML = "⚠️ Error generating summary.";
      }
    });
  });
});
