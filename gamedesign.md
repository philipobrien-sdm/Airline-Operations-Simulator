GAME DESIGN DOCUMENT (GDD)
Title: AeroDynasty (placeholder)
Genre: Airline Management Simulation
Platforms: PC (Windows/macOS/Linux), later potential for tablet
Mode: Single-player sandbox + optional future multiplayer
Engine: Your radar simulator + UI layer (engine-agnostic)
1. GAME OVERVIEW
1.1 Core Fantasy

You build an airline from nothing—choosing aircraft, hiring staff, opening routes, surviving winter, and competing ruthlessly in a living, breathing airspace simulation powered by real operational constraints.

1.2 Unique Selling Points

Real-time radar-driven operations (traffic, delays, weather, flow control).

Deep airline management (fleet, staff, finance, competition).

Seasonal and strategic planning (survive winters, boom in summers).

AI airlines that adapt and compete dynamically.

2. CORE GAME LOOP
Plan → Operate → Evaluate → Expand

Plan

Buy or lease aircraft.

Set routes and frequencies.

Hire staff with unique traits.

Adjust pricing, cabin layout, marketing.

Operate

Flights run through the radar simulation.

Weather, ATC congestion, delays occur.

Competitors add/remove flights in response.

Evaluate

Review financial performance and OTP.

Adjust strategy, cut unprofitable routes.

Expand

New aircraft, new hubs, new staff.

Seasonal expansion/reduction.

3. GAMEPLAY SYSTEMS
3.1 ROUTE MANAGEMENT SYSTEM
3.1.1 Airports

Each airport has:

Capacity (per hour arrival/departure rate).

Runway configuration.

Slots (seasonal, per-airport).

Weather patterns.

Passenger demand breakdown:

Business / Leisure

Domestic / International

Seasonal variation (summer peaks, winter troughs).

3.1.2 Demand Modeling

Demand depends on:

Population & GDP.

Competition.

Season.

Time of day (bank waves).

Connections offered by the player.

3.1.3 Route Planner UI

Drag-and-drop flight scheduling.

Shows:

Expected load factors.

Competitor presence.

Slot availability.

Estimated profit/loss.

Radar-based congestion warnings.

3.1.4 Bank Waves (Advanced)

Wave scheduling allows peaks of inbound flights to connect to outbound banks:

Increases revenue.

Increases operational complexity.

3.2 OPERATIONS SYSTEM (RADAR-POWERED)

This is the heart of the game.

3.2.1 Flight Simulation

Every flight is affected by:

Departure queues.

En-route ATC flow restrictions.

Weather.

Approach spacing.

Radar coverage limits.

Airport capacity.

3.2.2 Delay Propagation

Delays ripple through the day:

Crew duty time limits.

Aircraft rotations.

Missed connections.

Maintenance windows.

3.2.3 ATC Actions

Systems include:

Ground delay programs.

Miles-in-trail spacing.

Flow control by region.

Holding stacks.

Diversions.

Airborne rerouting.

3.2.4 Player Mitigation Tools

Players can:

Add spare aircraft (“floaters”).

Improve schedule resilience.

Invest in more reliable aircraft.

Add contingency fuel.

Reduce turnaround times via training.

3.3 FLEET SYSTEM
3.3.1 Aircraft Stats

Each aircraft type has:

Range

Fuel efficiency

Turnaround time

Reliability rating

Maintenance cost

Cabin layout options

Acquisition options:

Buy

Dry lease

Wet lease (ACMI)

Seasonal lease

3.3.2 Aircraft Age & Reliability

Older planes:

Need more maintenance.

Break more often.

Cause more delays.

Have lower fuel efficiency.

Newer planes:

Expensive but efficient.

Longer range.

Higher reliability.

3.3.3 Fleet Strategy

Players decide whether to:

Standardize (lower costs, easier crew training)

Diversify (open more routes but higher complexity)

3.4 STAFF SYSTEM
4 Staff Categories

Pilots (type-rated, experience levels)

Cabin Crew (service skill, language skills)

Engineers (maintenance speed, error chance)

Dispatchers/Ops Controllers (affect delay mitigation, fuel planning)

Managers (HR, marketing, finance)

Traits

Each staff member can have traits like:

“Precision-oriented” (reduced fuel burn, better OTP).

“Calm under pressure” (better disruption handling).

“Strict” (higher safety margin but more delays).

“Friendly” (higher satisfaction, lower crew turnover).

Hiring

Players recruit:

Via open adverts.

From pools.

By poaching from competitors.

Crew Pairing System

Scheduling must:

Respect duty time limits.

Respect type ratings.

Avoid fatigue penalties.

3.5 COMPETITION & AI AIRLINES
AI Behavior

AI airlines:

Add frequencies when profitable.

Cut losing routes.

Lease planes seasonally.

Price match aggressively.

Form alliances.

Attempt hub dominance.

Target the player if:

The player enters their home hub

The player grows too fast

The player drops prices

AI Personalities

Examples:

Legacy Giant: slow but stable, strong hubs.

Low-Cost Carrier: aggressive, high-frequency, low fare.

Regional Feeder: niche but resilient.

Premium Boutique: small network, high service quality.

3.6 ECONOMIC SYSTEM
3.6.1 Revenue

Ticket sales (dynamic pricing).

Ancillaries:

Bags

Seat selection

Food

Bundle packages

Cargo revenue.

Charter flights (seasonal).

3.6.2 Costs

Fuel (volatile).

Staff salaries.

Maintenance.

Airport fees:

Landing fees

Parking

Navigation charges

Ground handling

Lease payments.

Marketing spend.

Winterizing/storage.

3.6.3 Seasonal Cycles

Summer: demand +30% to +60%.

Winter: demand -20% to -50%.

Business hubs: stable year-round.

Holiday peaks:

Christmas

Easter

Ramadan

School breaks

3.6.4 Economic Events

Fuel price spikes.

Economic recession.

Volcano ash.

ATC strikes.

Competitor bankruptcy.

3.7 PROGRESSION SYSTEM
Starting Options

Players can choose:

LCC start (one old A319, €10M).

Regional turbo-props (two ATR 42).

Leisure operator (one leased 737).

Boutique airline (E-Jet, premium layout).

Goals

Survive first winter.

Grow to 10 planes, then 50, then global reach.

Form alliances.

Dominate a hub.

Launch long-haul operations.

Achievements / Milestones

First profitable year.

90% OTP month.

95% load factor season.

First long-haul flight.

First widebody acquired.

Overcoming a large disruption event.

3.8 USER INTERFACE
Key Screens

Dashboard/HQ Overview

Finance summary

Fleet status

OTP

Staff issues

Alerts & events

Route Planner

Map view

Competitor routes

Demand overlays

Operations Control Center

Live radar view (your simulator)

Delay management

Diversions

Crew legality

Maintenance alerts

Fleet Management

Aircraft ages, leases, next maintenance

Staff Management

Rosters

Skills & traits

Hiring & training

Finance Panel

Cash flow

Profitability per route

Fuel contracts

Lease management

4. DYNAMIC WORLD SYSTEM
4.1 Weather

Rain

Fog

Thunderstorms

Crosswinds

Snow/ice

Hurricanes & typhoons

Impacts:

Reduced airport capacity

Diversions

Icing delays

Route reassignments

4.2 Events

ATC strikes

Airport construction/closure

Security changes

Health outbreaks (reduce demand)

Economic booms

Fuel crises

Competitor collapses

Each event forces strategic adaptation.

5. DESIGN PILLARS
Realism without overwhelming

Complexity is depth, not difficulty.

Meaningful choices

Every decision should have opportunity cost.

Player-driven storytelling

Your failures and successes feel earned.

Radar simulation as the heart

Everything in the game respects real-world physics, traffic, and constraints.

6. LONG-TERM VISION
Future Features (post-launch)

Multiplayer (competitive or cooperative).

Real-world airport data importing.

Mods for aircraft packs.

Scenario modes (post-pandemic recovery, fuel crisis, EU261 nightmare scenario).

VR control center view.

7. DEVELOPMENT ROADMAP (suggested)
Phase 1 — Foundation

Integrate radar sim with flight scheduling.

Basic aircraft & routes.

Basic economy.

Simple AI competition.

Phase 2 — Depth

Staff system

Aircraft aging & maintenance

Delay propagation

Seasonal scheduling

Phase 3 — Full Experience

Events & disruptions

Dynamic AI

Alliances

Charters

Advanced hub management

Phase 4 — Polish

UX refinement

Tutorials

Balancing

Performance optimization
