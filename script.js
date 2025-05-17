document.addEventListener("DOMContentLoaded", () => {
  // Fetch and populate saved data
  chrome.storage.local.get(["maxTime", "websites"], (data) => {
    const maxTimeInput = document.getElementById("maxTime");
    const websitesTextarea = document.getElementById("websites");

    // Set saved values or defaults
    if (data.maxTime) {
      maxTimeInput.value = data.maxTime / 3600; // Convert seconds back to hours
    }
    if (data.websites) {
      websitesTextarea.value = data.websites.join(", "); // Join array into a comma-separated string
    }
  });
});

// Save updated values
document.getElementById("submitBtn").addEventListener("click", () => {
  const maxTimeInput = document.getElementById("maxTime");
  const websitesInput = document.getElementById("websites");

  const maxTime = parseInt(maxTimeInput.value) * 3600; // Convert hours to seconds
  const websites = websitesInput.value
    .split(",")
    .map((site) => site.trim())
    .filter((site) => site); // Remove empty entries

  // Validation
  let validationErrors = [];

  // Check if maxTime is a positive number greater than 0
  if (
    !maxTimeInput.value ||
    isNaN(maxTime) ||
    parseInt(maxTimeInput.value) <= 0
  ) {
    validationErrors.push(
      "Please enter a valid number greater than 0 for 'Max Daily Time'."
    );
  }

  // Check if websites field is not empty
  if (!websitesInput.value.trim()) {
    validationErrors.push("Please enter at least one website.");
  }

  // If there are validation errors, show an alert and stop execution
  if (validationErrors.length > 0) {
    alert(validationErrors.join("\n"));
    return;
  }

  const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

  // Save to chrome.storage.local
  chrome.storage.local.set(
    { maxTime, websites, lastTrackedDate: today },
    () => {
      alert("Settings saved!");
    }
  );
});

let interval = null;

// Function to update the timer display
function updateTimerDisplay(timeSpent) {
  // Convert timeSpent to a human-readable format (hh:mm:ss)
  document.getElementById("timer").innerText = new Date(timeSpent * 1000)
    .toISOString()
    .substr(11, 8);
}

// Fetch and display the running timer
function startTimer() {
  clearInterval(interval); // Clear any existing intervals
  console.log("Starting front-end timer...");

  // Fetch the latest `timeSpent` from storage and update the display
  const updateDisplay = () => {
    chrome.storage.local.get(["timeSpent"], (data) => {
      const timeSpent = data.timeSpent || 0;
      updateTimerDisplay(timeSpent); // Update the timer display
    });
  };

  // Update the display immediately
  updateDisplay();

  // Set an interval to refresh the display every second
  interval = setInterval(updateDisplay, 1000);
}

// Clear the interval when the popup is closed
window.addEventListener("unload", () => {
  clearInterval(interval);
});

// When the popup opens
document.addEventListener("DOMContentLoaded", () => {
  startTimer();
});
