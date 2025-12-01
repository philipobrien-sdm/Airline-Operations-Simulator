# AeroDynasty - Airline Management Simulator

## What is this Game?
This application is a real-time airline management simulation game. Your goal is to build a successful airline from a small startup into a global powerhouse. You will buy aircraft, hire staff, and create routes to meet passenger demand, all while operating in a living, breathing airspace powered by a real-time radar simulation. You must manage finances carefully, compete with AI airlines, and navigate operational challenges like weather and radar outages.

This project is currently in **Sprint 1** of its development, based on the detailed [Game Design Document](./gamedesign.md).

## Core Features (MVP Target)
*   **Interactive Map:** Utilizes the Google Maps API for a realistic, pannable, and zoomable map of Europe showing airports and live air traffic.
*   **Dynamic Demand System:** Click on any airport to see detailed passenger demand data for its connecting routes, broken down by time of day (morning, afternoon, evening).
*   **Basic Economy:** Start with a set amount of cash. Earn revenue from ticket sales and manage costs like fuel and airport fees.
*   **Fleet Management:** Purchase and lease different types of aircraft, each with unique stats for range, capacity, and efficiency.
*   **Route Planning:** Create and manage your airline's flight schedule.
*   **Live Operations:** Your flights operate in real-time on the map, where they are subject to delays from airport congestion and must remain within radar coverage.
*   **AI Competition:** The sky is filled with AI-controlled airlines that create a dynamic and competitive environment.

## 🚀 Installation and Setup in Google AI Studio
Follow these steps to download the code and run your own instance of the application in Google AI Studio.

### Step 1: Download the Project from GitHub
This step is for users who have cloned this project from a Git repository.

1.  On the repository page, click the green `< > Code` button.
2.  In the dropdown menu, select "Download ZIP".
3.  Save the ZIP file to your computer and unzip it. You will now have a folder named something like `aerodynasty-main`.

### Step 2: Prepare the ZIP for AI Studio
This is the most important step. AI Studio requires the `index.html` file to be at the top level of the zip file, but a GitHub download puts it inside a folder. You must re-zip the core files.

1.  **Navigate inside** the unzipped `aerodynasty-main` folder. You should see all the project files and folders (`index.html`, `App.tsx`, `components`, etc.).
2.  **Select the application files.** Select all the files and folders inside this directory.
3.  **Create the new ZIP file.** With all the app files selected, right-click and choose:
    *   **Windows:** "Send to" > "Compressed (zipped) folder".
    *   **Mac:** "Compress [X] items".
4.  Rename the new ZIP file to something clear, like `aistudio-aerodynasty-upload.zip`.

**CRITICAL:** By zipping the contents directly, you ensure that `index.html` is at the root of your new zip file, which is what AI Studio needs.

### Step 3: Upload and Run in AI Studio
1.  **Go to the Google AI Studio App Gallery:** Open your web browser and navigate to `aistudio.google.com/app`.
2.  **Create a New App:** Click "Create new" and select "Zip upload".
3.  **Upload Your ZIP:** Select the `aistudio-aerodynasty-upload.zip` file you created in the previous step. AI Studio will build the project and launch the application.

Your application is now set up and ready to use!

## 📖 How to Play (Sprint 1)
1.  **Read the Welcome Guide:** A pop-up will introduce the game's objective.
2.  **Analyze Demand:** Click on various airports to inspect the passenger demand on different routes. This is the key to planning your future airline.
3.  **Monitor the World:** Observe the ambient AI traffic and the radar network coverage. Note how radar outages can create operational challenges.
4.  **Plan Your Airline:** Use the information you've gathered to decide where you will start your airline in future sprints!

## 🔒 Privacy
*   **API Key:** The application uses a hardcoded Google Maps API key to ensure immediate functionality in the demo environment. For your own projects, it's recommended to manage API keys securely using a service like Google AI Studio's secrets manager.
*   **User Data:** No game data is stored or logged anywhere. Your session is entirely contained within your browser.