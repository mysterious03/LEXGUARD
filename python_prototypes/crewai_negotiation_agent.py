import os
import sys
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool

# ─────────────────────────────────────────────────────────
# LexGuard Multi-Agent Python Prototype (CrewAI + SerpAPI)
# ─────────────────────────────────────────────────────────
# This prototype showcases how LexGuard's multi-agent 
# adversarial simulation architecture maps to standard CrewAI concepts.
# Features:
# - Live .env loading of Gemini & SerpAPI keys
# - Real-time SerpAPI search tool for Indian Case Precedents
# - Fully chained Prosecutor, Defender, and Judge Agents
# ─────────────────────────────────────────────────────────

# Helper: Load API Keys from workspace .env
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if not os.path.exists(env_path):
        env_path = '.env'
    
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    # Clean quotes if present
                    val = val.strip('"').strip("'")
                    os.environ[key] = val

load_env()

# Bind main API Keys
GEMINI_KEY = os.environ.get("VITE_GEMINI_KEY") or ""
SERP_KEY = os.environ.get("VITE_SERP_API_KEY") or ""

os.environ["GEMINI_API_KEY"] = GEMINI_KEY
os.environ["SERPAPI_API_KEY"] = SERP_KEY

# ─── 1. Define the Real-time SerpAPI Search Tool ─────────
@tool("Indian Precedent Search Tool")
def search_indian_precedent(query: str) -> str:
    """Searches SerpAPI in real-time for Indian employment contract disputes, Supreme Court, and High Court case precedents."""
    import requests
    url = f"https://serpapi.com/search.json?engine=google&q={query}&gl=in&hl=en&api_key={SERP_KEY}"
    try:
        res = requests.get(url, timeout=10).json()
        results = res.get("organic_results", [])
        if results:
            top = results[0]
            return f"Precedent: {top.get('title')} — {top.get('snippet')} (URL: {top.get('link')})"
    except Exception as e:
        return f"SerpAPI Search failed: {str(e)}"
    return "No legal precedents found."

# ─── 2. Define the Agents ────────────────────────────────
prosecutor_agent = Agent(
    role='Aggressive Indian Contract Prosecutor',
    goal='Identify all risks, toxic language, and Indian employment law conflicts in the contract clause.',
    backstory='You are a fierce legal advocate in India who represents the EMPLOYEE. You expose every hidden corporate trap, worst-case scenario, and violation of Indian labor laws.',
    verbose=True,
    allow_delegation=False,
    llm="gemini/gemini-2.0-flash",
    tools=[search_indian_precedent]
)

defender_agent = Agent(
    role='Tech Company General Counsel',
    goal='Defend the clause and argue why it is industry standard, essential, or legally reasonable.',
    backstory='You defend Indian tech companies. You reference practices of Indian giants (e.g. Zepto, Razorpay, CRED) and push back on exaggerated prosecutor risks.',
    verbose=True,
    allow_delegation=False,
    llm="gemini/gemini-2.0-flash"
)

judge_agent = Agent(
    role='Impartial Employment Law Judge',
    goal='Weigh the arguments from Prosecutor and Defender, formulate a plain-English verdict, and assign a final risk score.',
    backstory='You are a retired Senior Judge of the High Court of India. You look at both stances to deliver the absolute legal truth, actionable recommendations, and a risk score (0-100).',
    verbose=True,
    allow_delegation=False,
    llm="gemini/gemini-2.0-flash"
)

# ─── 3. Define the Workflow/Tasks ────────────────────────
def analyze_clause_with_crewai(clause_text):
    task1 = Task(
        description=f'Analyze this employment clause, search for real Indian court precedents using the tool, and identify all employee risks: {clause_text}',
        agent=prosecutor_agent,
        expected_output='A JSON object containing: {"riskLevel": "CRITICAL|HIGH|MEDIUM|LOW", "toxicPhrases": [], "violations": [], "precedents": "..."}'
    )

    task2 = Task(
        description='Evaluate the prosecutor\'s risks and draft a defense. Explain why the company needs this and where it is standard in the tech industry.',
        agent=defender_agent,
        expected_output='A JSON object containing: {"challenge": "...", "adjustedRisk": "...", "proposedAmendment": "..."}'
    )

    task3 = Task(
        description='Review BOTH the prosecutor and defender assessments. Formulate the final legal verdict, risk score, and specific action items.',
        agent=judge_agent,
        expected_output='A JSON object containing: {"finalVerdict": "...", "riskScore": 0-100, "actionRequired": "NEGOTIATE_THIS|ACCEPT_WITH_CAUTION|SIGN_CONFIDENTLY"}'
    )

    # ─── 4. Create the Crew and execute sequentially ────────
    lexguard_crew = Crew(
        agents=[prosecutor_agent, defender_agent, judge_agent],
        tasks=[task1, task2, task3],
        process=Process.sequential, # Tasks run sequentially passing agent context
        verbose=True
    )

    result = lexguard_crew.kickoff()
    return result

if __name__ == "__main__":
    sample_clause = "The employee agrees not to work for any direct competitor anywhere in India for a period of 1 year following termination of employment."
    print("==================================================")
    print("Starting CrewAI Real-Time Simulation for LexGuard...")
    print("==================================================")
    
    try:
        final_verdict = analyze_clause_with_crewai(sample_clause)
        print("\n================ FINAL JUDGE VERDICT ================")
        print(final_verdict)
        print("=====================================================")
    except Exception as e:
        print(f"\nExecution failed: {str(e)}")
        print("Please ensure crewai and dependencies are installed ('pip install crewai')")
