import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini generation with automatic fallback if primary model experiences high demand
async function generateAdvisorContent(options: {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API key is not configured.");
  }

  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} encountered an issue, trying fallback if available:`, err?.message || err);
      // Wait 300ms before attempting fallback
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error("All AI models were temporarily busy.");
}

const SYSTEM_PROMPT = `You are EduGuide AI, an intelligent, empathetic, and pragmatic Academic Advisor designed to help university and college students make better academic decisions.
Your mission is to understand each student's academic situation and provide practical, personalized, realistic and achievable guidance.

CORE RESPONSIBILITIES:
1. STUDY PLANNING: Create personalized daily, weekly, and exam-preparation schedules based on subjects, syllabus, exam dates, available study time, current prep level, and student priorities. Account for sleep (7-8 hrs), classes, meals, breaks, difficulty, exam proximity, and revision time. Prioritize sustainable schedules without burnout.
2. PERFORMANCE ANALYSIS: Help students understand marks, grades, attendance, strong/weak subjects, and improvement areas. When data is provided, identify patterns, clearly show calculations, and explicitly distinguish between PROVIDED DATA and CALCULATED ASSUMPTIONS.
3. ACADEMIC RISK DETECTION: Identify potential problems (upcoming deadlines, poor performance in a subject, insufficient prep time, attendance concerns, unrealistic study schedules). Explain the issue clearly and provide practical next steps.
4. LEARNING SUPPORT: Explain academic concepts in simple language appropriate to the student's level. Use examples, step-by-step explanations, short summaries, practice questions, and revision strategies.
5. GOAL SETTING: Help students convert vague goals into measurable goals (Target marks/GPA -> Subjects -> Weak topics -> Action plan -> Milestone tracking).
6. CAREER AND SKILL GUIDANCE: Help students explore careers based on degree, interests, skills, academic subjects, and goals. Provide multiple possible paths rather than forcing one choice.
7. ADAPTIVE PLANNING: If the student says their schedule changed, they missed a study session, or they have less time than expected, modify the plan dynamically instead of repeating the original plan.
8. COMMUNICATION STYLE:
   - Friendly, clear, concise, supportive, practical, and student-friendly.
   - Avoid overly complicated terminology, judgmental language, unrealistic schedules, or excessive motivational speeches.
   - Never assume information that the student has not provided. Ask clarifying questions only if critical.
   - If the student is overwhelmed, immediately simplify the task into the next 1–3 practical actions they can take.

CONVERSATION FLOW:
Step 1: Understand the problem.
Step 2: Ask for missing information only if necessary.
Step 3: Analyze the situation.
Step 4: Give a clear recommendation.
Step 5: Convert the recommendation into actionable steps.
Step 6: Offer a way to track or improve the plan.
Always format your answers with clean Markdown, clear headings, bullet points, and highlight 1-3 immediate Next Steps.`;

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// Chat endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;

    let contextualPrompt = SYSTEM_PROMPT;
    if (context) {
      contextualPrompt += `\n\nCURRENT STUDENT CONTEXT PROVIDED IN APP:\n${JSON.stringify(context, null, 2)}`;
    }

    // Format conversation for Gemini
    const contents: any[] = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    const reply = await generateAdvisorContent({
      contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello EduGuide AI!" }] }],
      systemInstruction: contextualPrompt,
      temperature: 0.7,
    });

    res.json({ reply: reply || "I am ready to help you with your academic goals. What would you like to work on today?" });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate guidance",
      reply: "I ran into a temporary issue analyzing your request. Let's break it down step-by-step: what is the most urgent academic task or subject you need help with right now?",
    });
  }
});

// Dedicated Study Planner Endpoint
app.post("/api/study-plan", async (req: Request, res: Response) => {
  try {
    const { subjects, availableHoursPerDay, examDate, currentLevel, priorities, daysOff } = req.body;

    const prompt = `Create a realistic, sustainable study and exam-preparation schedule for a university student.
STUDENT INPUTS:
- Subjects & Topics: ${JSON.stringify(subjects || [])}
- Available Study Hours per Day: ${availableHoursPerDay || "4"} hours
- Target/Exam Date: ${examDate || "In 3 weeks"}
- Current Preparation Level: ${currentLevel || "Moderate/Behind"}
- Student Priorities / Focus Areas: ${priorities || "High-weightage courses and weak subjects"}
- Planned Breaks/Rest days: ${daysOff || "1 rest morning/evening per week"}

REQUIREMENTS:
1. Daily time allocation with Pomodoro or 50/10 min blocks.
2. Must reserve minimum 7-8 hours for sleep, meal times, class time, and revision buffers.
3. Prioritize subjects with upcoming exams or high difficulty first.
4. Provide a structured Weekly Schedule (Monday - Sunday) with concrete micro-tasks.
5. Include Active Recall & Spaced Repetition checkpoints.
6. Provide emergency contingency advice (what to do if they miss 1 session).
Respond with clear Markdown with clear tables/bullet lists.`;

    const plan = await generateAdvisorContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
    });

    res.json({ plan });
  } catch (error: any) {
    console.error("Study plan error:", error);
    res.status(500).json({ error: error.message || "Failed to create study plan" });
  }
});

// Dedicated Adaptive Reschedule Endpoint
app.post("/api/adaptive-reschedule", async (req: Request, res: Response) => {
  try {
    const { currentPlan, reason, daysLeft, remainingSubjects } = req.body;

    const prompt = `The student's schedule has been disrupted. As EduGuide AI, adapt the study plan realistically without scolding or creating an impossible cramming schedule.
Disruption Reason: ${reason}
Days Remaining Until Exam/Deadline: ${daysLeft}
Remaining Subjects/Topics to Cover: ${JSON.stringify(remainingSubjects || [])}
Previous Plan Context: ${currentPlan || "Daily 3-hour sessions"}

Provide:
1. Immediate Reassurance: Normalize schedule disruptions and remove anxiety.
2. The Adapted Plan: Redistribute the most critical 80/20 topics realistically.
3. What to Drop or De-prioritize: Clear guidance on low-yield topics they can safely skim if time is limited.
4. Next 3 Immediate Actions for today.`;

    const adaptedPlan = await generateAdvisorContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
    });

    res.json({ adaptedPlan });
  } catch (error: any) {
    console.error("Adaptive reschedule error:", error);
    res.status(500).json({ error: error.message || "Failed to adapt schedule" });
  }
});

// Dedicated Concept Explanation Endpoint
app.post("/api/explain-concept", async (req: Request, res: Response) => {
  try {
    const { concept, subject, level } = req.body;

    const prompt = `Explain the following academic concept for a university/college student:
Concept: ${concept}
Subject: ${subject || "General Academic"}
Student Level: ${level || "Undergraduate beginner"}

Format your response strictly with:
1. 💡 Simple Intuition (Explain in 2-3 sentences like you're talking to a smart friend, no jargon).
2. 🪜 Step-by-Step Breakdown (Logical progression of how it works).
3. 🌍 Concrete Real-World Example or Analogy.
4. ❓ 3 Practice Questions (1 Easy check, 1 Exam-style application, 1 Conceptual tricky question) with expandable or clearly demarcated answers/hints.
5. ⚡ 60-Second Revision Summary (3 bullet points for quick recap before exam).`;

    const explanation = await generateAdvisorContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
    });

    res.json({ explanation });
  } catch (error: any) {
    console.error("Explain concept error:", error);
    res.status(500).json({ error: error.message || "Failed to explain concept" });
  }
});

// Dedicated Goal Transformer Endpoint
app.post("/api/goal-transformer", async (req: Request, res: Response) => {
  try {
    const { rawGoal, currentGpa, targetGpa, timeframe } = req.body;

    const prompt = `The student has a vague academic goal: "${rawGoal}".
Current Standing: ${currentGpa || "Not specified"}
Target Standing: ${targetGpa || "Not specified"}
Timeframe: ${timeframe || "This semester"}

Convert this into a structured, measurable SMART academic plan:
1. 🎯 Precision Target (Quantified, measurable outcome).
2. 🔍 Identified Subject & Weak-Topic Priorities.
3. 📅 4-Stage Action Roadmap (Weeks 1-2, Weeks 3-6, Mid-point check, Final stretch).
4. ⏱️ Daily/Weekly Micro-habits (Small sustainable routines).
5. 📊 Progress Metrics & Checkpoint Criteria (How to know they are on track).
6. 🛡️ Risk Safeguard (What to do when motivation drops).`;

    const structuredGoal = await generateAdvisorContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.6,
    });

    res.json({ structuredGoal });
  } catch (error: any) {
    console.error("Goal transformer error:", error);
    res.status(500).json({ error: error.message || "Failed to transform goal" });
  }
});

// Dedicated Career Pathway Explorer Endpoint
app.post("/api/career-guidance", async (req: Request, res: Response) => {
  try {
    const { degree, interests, skills, academicStrengths, careerGoals } = req.body;

    const prompt = `Help a student explore career and skill pathways based on their academic background:
- Degree / Major: ${degree || "Undergraduate"}
- Genuine Interests: ${interests || "General"}
- Current Skills: ${skills || "Foundational"}
- Strong Academic Subjects: ${academicStrengths || "Varied"}
- Potential Career Aspirations: ${careerGoals || "Open to exploring"}

Provide:
1. 🧭 3 to 4 Diverse Career Pathways (Do NOT force just one single choice; offer distinct directions, e.g. Industry/Corporate, Research/Academia, Creative/Technical, Entrepreneurial/Cross-disciplinary).
2. For each pathway:
   - What the role actually does day-to-day.
   - Recommended elective subjects or courses to take right now.
   - Essential hard & soft skills to build during college.
   - 1 high-impact portfolio project or internship step to stand out.
3. 🚀 Next 2 immediate steps the student can take this week on campus.`;

    const careerPaths = await generateAdvisorContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    });

    res.json({ careerPaths });
  } catch (error: any) {
    console.error("Career guidance error:", error);
    res.status(500).json({ error: error.message || "Failed to generate career guidance" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduGuide AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
