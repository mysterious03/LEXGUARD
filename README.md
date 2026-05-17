<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/scale.svg" alt="LexGuard Logo" width="80" height="80">
  <h1 align="center">LEXGUARD</h1>
  <p align="center">
    <strong>Agentic Legal Intelligence · 6-Agent Sequential Chain</strong>
    <br />
    A production-grade adversarial AI legal simulation designed to decode, debate, and simulate consequences of employment contracts.
  </p>
</div>

<hr />

## ⚡ What is LexGuard?

**LexGuard** is a sophisticated, real-time AI legal engine. It doesn't just "read" your contract—it puts your contract on trial. By utilizing a **6-agent adversarial pipeline**, LexGuard automatically extracts clauses, analyzes them for toxic language, debates them using simulated prosecutors and defenders, delivers a judicial verdict, simulates HR negotiations, and projects future financial exposure.

LexGuard is built with a premium, Vercel/Linear-inspired dark mode UI to provide a cinematic, high-stakes experience.

---

## 🧠 The 6-Agent Sequential Pipeline

The core engine is powered by an adversarial AI workflow where each agent builds on the full output of the previous agents:

1. 📂 **ClauseSplitter AI**: Ingests raw contract text and precisely extracts and categorizes individual legal clauses.
2. 🚨 **Prosecutor AI**: Aggressively attacks the clause, hunting for toxic phrases, hidden loopholes, and worst-case scenarios.
3. 🛡️ **Defender AI**: Defends the clause, comparing it to standard market practices and proposing reasonable amendments.
4. ⚖️ **Judge AI**: Weighs the arguments, calculates a final risk score, and issues a final verdict on whether to sign or negotiate.
5. ⚔️ **War Room (HR Simulation)**: Simulates a 3-round email negotiation between you and a simulated aggressive HR department based on the Judge's findings.
6. 🔮 **Future Consequence Engine**: Generates a future timeline projecting the long-term legal and financial fallout if the clause is signed as-is. Features real-time **SerpAPI** integration to pull live Indian legal precedents.

---

## 🚀 Tech Stack

- **Frontend Core**: React 18, Vite
- **Design & UI**: Custom premium dark mode (Vanilla CSS + Framer Motion for cinematic animations)
- **Icons**: Lucide React
- **AI Inference Engine**: 
  - Primary Inference: **Llama-3.3-70b via Groq** (for blazing-fast sequential reasoning)
  - Fallback Engine: **Gemini 2.0 Flash**
- **Live Research**: **SerpAPI** (fetches live Supreme/High Court case precedents in real-time)
- **Local Prototyping**: Contains a fully functional Python prototype using `CrewAI` in the `python_prototypes/` directory.

---

## 🛠️ Getting Started (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/mysterious03/LEXGUARD.git
cd lexguard
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_GROQ_KEY=your_groq_api_key
VITE_GEMINI_KEY=your_gemini_api_key
VITE_SERP_API_KEY=your_serpapi_key
```

### 3. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

> **Note**: LexGuard uses a Vite proxy (`/api-groq`) to bypass browser CORS restrictions when communicating directly with Groq. Ensure you run the app via the Vite dev server for full functionality.

---

## 📁 Project Structure Highlights

- `src/App.jsx`: Main orchestration UI & state machine handling view transitions.
- `src/api/agents.js`: Core LLM prompts and deep-extraction JSON parsing logic for all 6 agents.
- `src/components/CourtroomEngine.jsx`: The 3-column Debate UI (Prosecutor vs Defender vs Judge).
- `src/components/FutureSimulation.jsx`: The consequence prediction engine displaying the timeline, War Room negotiation, and live SerpAPI data.
- `python_prototypes/crewai_negotiation_agent.py`: A Python implementation of the pipeline for CLI experimentation.

---

<div align="center">
  <p>Built for the Future of Legal Intelligence.</p>
</div>
