# AeroDynasty User Guide (V1 Alpha)

Welcome to AeroDynasty! This guide will walk you through everything you need to know to build your airline from a single plane into a global empire.

## 1. Introduction

### 1.1 The Goal
AeroDynasty is a real-time airline management simulation. Your objective is to create a profitable airline by buying aircraft, hiring staff, planning routes, and competing against other airlines in a dynamic world.

### 1.2 Core Concept
The game revolves around a weekly cycle. You begin each week in a **Planning Phase** where you set up your aircraft schedules. Once you "Lock-in" your schedules, the week begins, and your airline operates in real-time. At the end of the week, the game pauses, presents you with a performance report, and you begin planning for the next week.

## 2. Getting Started

When you first launch the game, you'll see the **Welcome Modal**.

*   **Difficulty:** Choose between Easy, Medium, or Hard. This affects the severity of random events like strikes and bad weather.
*   **Start Standard Game:** Begins the game with a single Airbus A320 at London Heathrow (LHR) and a starting cash balance. You are in full control from the start.
*   **Quick Start:** Purchases a small, pre-defined fleet for you (one A320 and three ATR-72s) and deducts the cost from your cash. This is a great way to get flying immediately.
*   **Start Tutorial:** This is the recommended option for first-time players. It will launch an interactive, guided tour of the main game mechanics.

## 3. The Main Interface

The game screen is divided into three main areas:

### 3.1 The Map (Center)
This is your view of the operational world.
*   **Airports:** Represented by their three-letter codes (e.g., LHR). The color of the dot next to the code indicates its status:
    *   **Green:** In your radar range.
    *   **Red:** Outside your radar range.
    *   **Yellow:** Disrupted by an event (e.g., weather).
    *   **Cyan:** Benefitting from a positive event (e.g., a concert).
*   **Aircraft:** Your planes (cyan) and competitor planes (yellow) fly their routes in real-time.
*   **Hubs:** Airports where you or competitors base multiple aircraft are marked with star icons. Hubs provide cost and demand bonuses.

### 3.2 The Info Panel (Left)
This panel is context-sensitive and displays detailed information about whatever you have selected on the map (an airport or one of your aircraft).

### 3.3 The Right Panel
This is your primary command center.
*   **Controls:** Game time, play/pause controls, game speed, and buttons to access key management screens (Fleet, Competition, Staff).
*   **Fleet List:** An at-a-glance overview of all your aircraft, their current status, and location. Aircraft without a schedule are highlighted in red.
*   **Airport List:** A scrollable list of all airports in the game.

### 3.4 The Ticker (Bottom)
This bar displays real-time alerts and event notifications. You can click it to see a modal with all current events.

## 4. Core Gameplay

### 4.1 Fleet Management
Accessed from the "Manage Fleet" button. Here you can buy new aircraft.
*   **Home Base:** Before buying, you must select a "Home Base" airport where the new aircraft will be based.
*   **Aircraft Stats:** Each aircraft has unique stats for range, speed, capacity, and cost.
*   **Profitability Preview:** A simple indicator shows the potential profitability of an aircraft type based on the routes available from your selected home base.

### 4.2 Route Planning & Scheduling
This is the heart of your airline's strategy. Select one of your aircraft to begin.

1.  **The Schedule Tab:** This tab in the Info Panel is where you build the flight plan.
2.  **Adding Flights:** Select a destination from the "Add Next Flight" dropdown. The list is automatically filtered to show valid routes from the aircraft's current location.
3.  **Auto-Scheduling:** For a quick start, use the "Auto-Schedule" button. The AI will attempt to create a profitable, multi-leg schedule that returns the aircraft to its home base at the end of the day. You can use "Auto-Reschedule" to generate a new plan at any time during the planning phase.
4.  **Route Analysis & Fares:** Click on any flight leg in the schedule to open the **Route Analysis Modal**. Here you can see a detailed breakdown of projected profit and adjust your ticket prices (Fare Multiplier) to maximize revenue.
5.  **Locking In:** Once you are happy with your schedules for the week, click the "Lock-in Schedules" button on the right panel. This will start the simulation for the week.

### 4.3 Staff Management
A skilled team can give you a significant competitive advantage. Access this via the "Manage Staff" button.

*   **Hiring:** You hire staff into a central "pool".
*   **Assigning:** You can then assign staff from the pool to specific aircraft or hubs via the Info Panel.
*   **Staff Types:**
    *   **Pilots (Aircraft):** Reduce chances of technical faults and mitigate weather delays.
    *   **Cabin Crew (Aircraft):** Boost passenger demand on competitive routes.
    *   **Engineers (Fleet-wide):** Passively reduce the chance of technical faults across your entire fleet.
    *   **Dispatchers (Hubs):** Mitigate the negative impact of strikes and bad weather at their assigned hub.

### 4.4 Competition
The skies are not empty. Click the "Competition" button to see the schedules of all AI airlines.

*   **Competition Alerts:** If a competitor's flight directly conflicts with one of yours (same route, similar time), the modal will highlight it.
*   **Market Analysis:** For conflicting flights, you'll see an analysis of passenger demand vs. the total combined capacity of your plane and your competitor's.
*   **Strategic Actions:** If a route is "Over-Saturated" (more seats than passengers), you are given options to compete:
    *   **Adjust Fare:** Fine-tune your ticket prices to be more attractive.
    *   **Launch Marketing Campaign:** Pay to temporarily boost passenger demand on that route.

### 4.5 Customer Satisfaction
On competitive routes, passengers don't just choose the first available flight—they choose the airline they prefer.

*   **Building Loyalty:** Your "Satisfaction Score" on a route increases with successful, on-time flights. It is also positively affected by lower ticket prices.
*   **Aircraft Upgrades:** You can purchase one-off upgrades for your aircraft (In-Flight Entertainment, Wi-Fi, Meal Service) in the "Upgrades" tab of the aircraft's Info Panel. These provide a significant boost to customer satisfaction.
*   **Competitor Satisfaction:** You can see a high-level overview of your competitors' satisfaction ratings in the Competition modal.

## 5. The Weekly Cycle

*   **Planning:** At the start of Day 1 of each week, the game is paused. This is your time to adjust schedules, buy planes, and manage staff. Your schedules from the previous week carry over, so you only need to make changes.
*   **Operations:** Once you lock in your schedules, the week plays out in real-time.
*   **Reporting:** At the end of Day 7, the game pauses again, and the **Weekly Report Modal** is displayed. This report shows your top routes, daily P&L, and strategic opportunities, helping you plan for the week ahead.

Good luck, CEO!
