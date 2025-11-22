<div align="center">
  

  <h1>PolyArbor Rhythm Generator</h1>
  
  <p>
    <strong>A High-Performance, Browser-Based Generative Polyrhythm Sequencer.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Web_Audio_API-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Web Audio API" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>


| | | |
|:---:|:---:|:---:|
| <img width="100%" src="https://github.com/user-attachments/assets/cea4b849-30ee-495f-aac7-868c6bd01b0e"> | <img width="100%" src="https://github.com/user-attachments/assets/f46dd8ef-7961-498e-a103-58701fa2d704"> | <img width="100%" src="https://github.com/user-attachments/assets/d0564f3c-245c-4648-94b1-fd19c5504734"> |

  
  
  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#technical-architecture">Architecture</a> •
    <a href="#user-interface">Interface</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## Overview

**PolyArbor** explores the mathematical relationship between conflicting time signatures and playback rates through the lens of organic procedural synthesis. Unlike standard sequencers that align to a rigid 4/4 grid, PolyArbor utilizes a cyclical timing engine where every rhythm layer operates on its own step count and speed multiplier relative to a global master cycle.

This architecture creates phasing, polymetric patterns that evolve over time, visualized as a pulsating organic vector scope. Built with a focus on high-performance audio scheduling, the application mimics the aesthetic and reliability of a professional Digital Audio Workstation (DAW).

---

## Features

### Audio Engine
* **Web Audio API Core:** A custom-built scheduling engine utilizes lookahead timing for sample-accurate playback. This prevents rhythm drift and maintains synchronization even when the main JavaScript thread is under load.
* **Procedural Synthesis:** All sound is generated in real-time using `OscillatorNodes`. No pre-recorded samples are utilized.
    * **Primary Tone:** Sine waves generate the body of the sound.
    * **Accents:** Triangle waves trigger on the first beat of a cycle to denote phase reset.
* **Dynamic Spatial Audio:** Every channel supports individual stereo panning and volume attenuation.

### Sequencer Capabilities
* **Unlimited Polyphony:** Support for up to 12 distinct rhythm layers running simultaneously.
* **Polyrhythmic Control:** Users can set individual step counts (1 to 32) per channel independently.
* **Rate Multiplication:** Decouples rhythm speed from rhythm shape. Channels can run at fractional speeds (1/4x, 1/2x) or multiples (2x, 3x, 4x) of the master tempo.
* **Pentatonic Scaling:** Frequencies are automatically mapped to a pentatonic scale, ensuring harmonic consonance regardless of random configuration.

### Visualizer
* **Vector Scope:** A high-framerate, Canvas-based visualization rendering a radial tree graph.
* **Interpolated Animation:** Visual elements interpolate smoothly between audio ticks, decoupled from the React render cycle to ensure consistent 60fps performance.
* **Responsive Design:** Utilizes `ResizeObservers` to adapt to container changes without stretching, blurring, or pixelation.

---

## Technical Architecture

### Core Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Iconography** | Lucide React |
| **Audio** | Web Audio API |

### System Design

* **Audio Service (Singleton):** The `AudioEngine` class serves as a singleton service. It manages the `AudioContext` lifecycle and the scheduling lookahead loop, communicating with React components via a shared state model.
* **UI Context:** A global `UIContext` manages high-level interaction states. This includes "Global Dragging" (locking the UI while adjusting knobs) and the Singleton Tooltip Manager (ensuring only one tooltip exists at a time).
* **Component Library (SynthUI):** A custom library developed specifically for this application. It provides skeuomorphic controls—Knobs, LCDs, Toggle Switches—that mimic hardware behavior, including vertical-drag value adjustment.

---

## User Interface

The application interface is styled after professional production software, utilizing a dark, high-contrast color palette ("Industrial/DAW" theme).

### 1. Top Toolbar
* **Transport Controls:** Play/Stop toggle and Tempo (Cycles Per Minute) adjustment.
* **Master Output:** Global volume knob and percentage readout.
* **Info Panel:** Access to developer credits and system information.

### 2. Channel Rack
Located on the left sidebar, this contains the stack of active oscillators.
* **Mute/Solo:** Toggles active status for the channel.
* **Pan/Vol:** Rotary knobs for stereo placement and gain.
* **Step Counter:** Defines the geometric shape of the rhythm (e.g., 3 for a triangle/triplet feel, 4 for a square/quarter feel).
* **Rate Selector:** Multiplies the playback speed of the specific channel relative to the global cycle.

### 3. Visualizer Output
The central panel renders the **Poly Tree**.
* **Center Point:** Represents the start of the master cycle.
* **Radial Arms:** Each arm represents a rhythm channel.
* **Pulses:** Visual dots travel along the arms; when a dot reaches a node, a sound is triggered.
* **Vector Aesthetic:** Styled with "phosphor" trails and scanline overlays to mimic vintage oscilloscope equipment.

---

## Getting Started

### Prerequisites
* **Node.js:** v16 or higher
* **Package Manager:** npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/dovvnloading/POLYARBOR-Rhythm-Generator.git](https://github.com/dovvnloading/POLYARBOR-Rhythm-Generator.git)
    ```

2.  Navigate to the project directory:
    ```bash
    cd POLYARBOR-Rhythm-Generator
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

4.  Start the development server:
    ```bash
    npm start
    ```

The application will launch automatically at `http://localhost:3000`.

---

## Credits

**Developer:** Matthew Robert Wesney

* **GitHub:** [dovvnloading](https://github.com/dovvnloading)
* **Repository:** [POLYARBOR-Rhythm-Generator](https://github.com/dovvnloading/POLYARBOR-Rhythm-Generator)

**Acknowledgments:**
* Google DeepMind for advancements in AI-assisted development workflows.
