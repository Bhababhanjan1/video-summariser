document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");

  // Get current tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("youtube.com/watch")) {
    output.innerHTML = `🎥 Detected video: <br><span class="text-gray-300">${tab.url}</span>`;
  } else {
    output.innerHTML = "⚠️ Please open a YouTube video page to summarize.";
  }

  document.getElementById("summarizeBtn").addEventListener("click", async () => {
    if (tab.url.includes("youtube.com/watch")) {
      output.innerHTML = "⏳ Summarizing video content... (This is where AI logic runs)";
      // TODO: Connect to your backend / AI API to fetch video transcript and summary
    } else {
      output.innerHTML = "🚫 No valid YouTube video detected.";
    }
  });
});
