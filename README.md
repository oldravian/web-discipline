# Web Discipline

**Web Discipline** is a simple and lightweight Chrome extension that helps you manage your time online by limiting daily usage on distracting websites like Facebook, YouTube, Instagram, and more. Set your daily time allowance, distracting website links, and let the extension track your usage. Once the limit is reached, access to the specified sites is automatically blocked for the rest of the day.

# Screenshot
![extension-screenshot](screenshots/web-discipline-extension-screenshot.png) 

## Features

-  **Daily Time Limit:** Set the maximum hours you can spend on selected websites daily.
-  **Custom Website List:** Add any websites you want to discipline yourself from (e.g., facebook.com, youtube.com).
-  **Automatic Blocking:** Once your time is up, the extension will redirect those sites to a blank page.
-  **Daily Reset:** Your usage timer automatically resets every new day.
-  **Live Timer:** A real-time timer shows your current usage when opening the extension popup.
-  **Minimal UI:** Clean, user-friendly design with helpful tooltips and green-themed styling.
-  **Perfect for Focus:** Great for students, professionals, and anyone who wants to stay productive online.


## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/web-discipline.git
   ```
2. Open chrome://extensions in your browser.

3. Enable Developer Mode.

4. Click Load Unpacked and select the project directory.


## Issues I found while testing
During testing this extension, I found below issues that need to be fixed:
1. Sometimes, the timer didn't stop even after the time limit was reached.
2. Sometimes extension blocks all sites other than the mentioned ones.

## Contribution
If you encounter any issues while using the extension, please feel free to report them directly to me or open a new issue on this GitHub repository.

Contributions are highly welcome! To contribute, simply fork the repository, create a new branch for your changes, and open a pull request against the master branch of this repository.
