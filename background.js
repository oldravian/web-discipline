let activeTab = null;
let interval = null;

// Listen for tab changes
chrome.tabs.onActivated.addListener(() => {
  console.log("Tab activated");
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      handleTabUpdate(tabs[0].id, tabs[0].url);
    }
  });
});

// Listen for tab updates (e.g., refresh)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("Tab updated and fully loaded");
    handleTabUpdate(tabId, tab.url);
  }
});

// Handle tab updates and start/stop the timer
function handleTabUpdate(tabId, url) {
  clearInterval(interval); // Clear any previous interval
  console.log("Handling tab update for tab:", tabId);

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
}

// Track time on active site
function trackTime({ maxTime }) {
  console.log("Incrementing time...");

  // Fetch the latest timeSpent and the stored date
  chrome.storage.local.get(["timeSpent", "lastTrackedDate"], (data) => {
    const currentSpent = data.timeSpent || 0; // Default to 0 if not set
    const lastTrackedDate = data.lastTrackedDate || ""; // Get the last tracked date

    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // Check if the day has changed
    if (lastTrackedDate !== today) {
      console.log("New day detected. Resetting timeSpent...");
      // Reset timeSpent and update the date
      chrome.storage.local.set({ timeSpent: 0, lastTrackedDate: today }, () => {
        console.log("Timer reset for the new day.");
      });
      return; // Exit to avoid incrementing the timer on the first check of the new day
    }

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

// Normalize URLs
function normalizeUrl(url) {
  // Remove 'www.' if it exists and convert to lowercase
  return url
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}

//observations
//handleTabUpdate called but timer still running
//timer didn't stopped even after time limit reached
//extension blocking all sites
