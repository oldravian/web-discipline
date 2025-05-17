let activeTab = null;
let interval = null;

// Listen for tab changes
chrome.tabs.onActivated.addListener(() => {
  console.log("Tab activated");
  updateTimer();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("Tab updated and fully loaded");
    console.log("Tab URL:", tab.url);
    updateTimerForTab(tabId, tab.url);
  }
});

// Update timer based on active site
function updateTimer(retryCount = 0) {
  clearInterval(interval); // Clear any previous interval
  console.log("Updating timer...");

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      // Ensure valid tab and URL
      const url = normalizeUrl(new URL(tabs[0].url).hostname); // Normalize the active URL
      console.log("Normalized active URL:", url);

      chrome.storage.local.get(["websites", "maxTime", "timeSpent"], (data) => {
        const websites = data.websites || [];
        const maxTime = data.maxTime || 0;

        console.log("Tracked websites:", websites);

        if (websites.includes(url)) {
          console.log(`Tracking time for ${url}`);
          activeTab = url;

          // Start a new timer for the active tab
          interval = setInterval(() => trackTime({ maxTime }), 1000);
        } else {
          console.log(`Not tracking ${url}`);
          activeTab = null;
          clearInterval(interval); // Stop the timer when switching to a non-tracked tab
        }
      });
    } else {
      // Retry if URL is not yet available (e.g., during refresh)
      if (retryCount < 5) {
        // Retry up to 5 times
        console.log("Retrying to get active tab...");
        setTimeout(() => updateTimer(retryCount + 1), 200); // Retry after 200ms
      } else {
        console.log("No active tab or invalid URL after retries.");
        activeTab = null;
        clearInterval(interval); // Stop the timer if no active tab or invalid URL
      }
    }
  });
}

function updateTimerForTab(tabId, url) {
  clearInterval(interval); // Clear any previous interval
  console.log("Updating timer for tab:", tabId);

  if (url) {
    const normalizedUrl = normalizeUrl(new URL(url).hostname); // Normalize the URL
    console.log("Normalized URL:", normalizedUrl);

    chrome.storage.local.get(["websites", "maxTime", "timeSpent"], (data) => {
      const websites = data.websites || [];
      const maxTime = data.maxTime || 0;

      console.log("Tracked websites:", websites);

      if (websites.includes(normalizedUrl)) {
        console.log(`Tracking time for ${normalizedUrl}`);
        activeTab = tabId;

        // Start a new timer for the active tab
        interval = setInterval(() => trackTime({ maxTime }), 1000);
      } else {
        console.log(`Not tracking ${normalizedUrl}`);
        activeTab = null;
        clearInterval(interval); // Stop the timer for non-tracked tabs
      }
    });
  } else {
    console.log("Invalid or missing URL for tab:", tabId);
    activeTab = null;
    clearInterval(interval); // Stop the timer if the URL is invalid
  }
}

// Track time on active site
function trackTime({ maxTime }) {
  console.log("Incrementing time...");

  // Fetch the latest timeSpent value from storage
  chrome.storage.local.get(["timeSpent"], (data) => {
    const currentSpent = data.timeSpent || 0; // Default to 0 if not set
    const updatedTime = currentSpent + 1; // Increment the time spent

    console.log("Current time spent:", currentSpent);
    console.log("Updated time spent:", updatedTime);

    // Save the updated timeSpent back to storage
    chrome.storage.local.set({ timeSpent: updatedTime }, () => {
      if (updatedTime >= maxTime) {
        console.log("Time limit reached, blocking site...");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { url: "about:blank" });
          }
        });
      }
    });
  });
}

function normalizeUrl(url) {
  // Remove 'www.' if it exists and convert to lowercase
  return url
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}
