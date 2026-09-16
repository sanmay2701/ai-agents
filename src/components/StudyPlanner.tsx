import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Bed,
  Coffee,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { StudySessionItem, SubjectItem, StudentProfile } from "../types";

interface StudyPlannerProps {
  sessions: StudySessionItem[];
  setSessions: React.Dispatch<React.SetStateAction<StudySessionItem[]>>;
  subjects: SubjectItem[];
  profile: StudentProfile;
  onConsultAdvisor: (prompt: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  sessions,
  setSessions,
  subjects,
  profile,
  onConsultAdvisor,
}) => {
  // Plan Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlanMarkdown, setGeneratedPlanMarkdown] = useState<string | null>(null);
  const [availableHours, setAvailableHours] = useState(3.5);
  const [prepLevel, setPrepLevel] = useState("Moderate / Slightly Behind");

  // Adaptive Reschedule state
  const [isAdaptiveModalOpen, setIsAdaptiveModalOpen] = useState(false);
  const [adaptiveReason, setAdaptiveReason] = useState("I missed yesterday's sessions because classes and an unexpected lab report ran late.");
  const [adaptiveDaysLeft, setAdaptiveDaysLeft] = useState(12);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedResultMarkdown, setAdaptedResultMarkdown] = useState<string | null>(null);

  // Filter by day
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const daysOfWeek = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGeneratedPlanMarkdown(null);

    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({
            name: s.name,
            difficulty: s.difficulty,
            currentMarks: s.currentMarks,
            targetMarks: s.targetMarks,
            examDate: s.examDate,
            weakTopics: s.weakTopics,
          })),
          availableHoursPerDay: availableHours,
          currentLevel: prepLevel,
          priorities: "High-difficulty subjects (Level 4-5) and upcoming exams within 2 weeks",
        }),
      });

      const data = await response.json();
      if (data.plan) {
        setGeneratedPlanMarkdown(data.plan);
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdaptiveReschedule = async () => {
    setIsAdapting(true);
    setAdaptedResultMarkdown(null);

    try {
      const response = await fetch("/api/adaptive-reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPlan: sessions.map((s) => `${s.day}: ${s.subject} (${s.focusTopic})`).join(", "),
          reason: adaptiveReason,
          daysLeft: adaptiveDaysLeft,
          remainingSubjects: subjects.map((s) => s.name),
        }),
      });

      const data = await response.json();
      if (data.adaptedPlan) {
        setAdaptedResultMarkdown(data.adaptedPlan);
      }
    } catch (err) {
      console.error("Adaptive plan error:", err);
    } finally {
      setIsAdapting(false);
    }
  };

  const filteredSessions =
    selectedDay === "All" ? sessions : sessions.filter((s) => s.day === selectedDay);

  const completedCount = sessions.filter((s) => s.completed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner: Sustainability & Adaptive Planning */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>Sustainable & Adaptive Strategy</span>
          </div>
          <h2 className="text-xl font-bold">Realistic Study & Exam Planner</h2>
          <p className="text-xs text-blue-200/90 mt-1 max-w-2xl leading-relaxed">
            Every study schedule strictly protects 7–8 hours of sleep, classes, and mental recovery. If life gets in the way, don't feel guilty—use our Adaptive Rescheduler to dynamically adjust.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-open-adaptive-reschedule"
            onClick={() => {
              setAdaptedResultMarkdown(null);
              setIsAdaptiveModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-300 hover:bg-amber-200 transition-colors shadow-xs"
          >
            <RotateCcw className="h-4 w-4" />
            <span>⚡ Adapt Disrupted Schedule</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("ai-planner-generator");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Full Plan</span>
          </button>
        </div>
      </div>

      {/* Sustainable Guardrails Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Bed className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">7–8h Sleep Protected</span>
            <span className="text-slate-500">No all-nighter recommendations</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Active Recall & Buffers</span>
            <span className="text-slate-500">10m rest per 50m study blocks</span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Zero-Guilt Adaptation</span>
            <span className="text-slate-500">Redistributes when life happens</span>
          </div>
        </div>
      </div>

      {/* Interactive Weekly Session Tracker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Study Agenda</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedCount} of {sessions.length} sessions completed ({Math.round((completedCount / (sessions.length || 1)) * 100)}%)
            </p>
          </div>

          {/* Day Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedDay === day
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="mt-4 space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No sessions scheduled for {selectedDay}. Click below to generate or add sessions.
            </div>
          ) : (
            filteredSessions.map((ses) => (
              <div
                key={ses.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  ses.completed
                    ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-950"
                    : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleSession(ses.id)}
                    className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                      ses.completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    {ses.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {ses.day}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ses.timeSlot}
                      </span>
                      <span className="text-xs font-bold text-blue-700">{ses.subject}</span>
                      {ses.priority === "high" && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Priority
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1.5 font-medium ${
                        ses.completed ? "line-through text-emerald-800" : "text-slate-800"
                      }`}
                    >
                      {ses.focusTopic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onConsultAdvisor(
                        `Can you help me prepare for this study block in ${ses.subject}: "${ses.focusTopic}"? Give me a 3-step active recall framework to master it in ${ses.durationMinutes} minutes.`
                      )
                    }
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    Guide Session
                  </button>
                  <button
                    onClick={() => handleDeleteSession(ses.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Adaptive Reschedule Dialog (Satisfies Core Responsibility #7) */}
      {isAdaptiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Adaptive Rescheduler</h3>
                  <p className="text-xs text-slate-500">
                    Modify your plan realistically without scolding or unfeasible cramming
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdaptiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">What caused the schedule disruption?</label>
                <textarea
                  value={adaptiveReason}
                  onChange={(e) => setAdaptiveReason(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                  placeholder="e.g. Fell ill for 2 days, family emergency, or classes took extra time"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Estimated Days Left Until Target Exams:
                </label>
                <input
                  type="number"
                  value={adaptiveDaysLeft}
                  onChange={(e) => setAdaptiveDaysLeft(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdaptiveModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdaptiveReschedule}
                  disabled={isAdapting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
                >
                  {isAdapting ? (
                    <span>Recalibrating Plan...</span>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate Non-Judgmental Adapted Plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Display Adapted Plan Markdown */}
              {adaptedResultMarkdown && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800">
                  <div className="prose prose-xs max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1.5">
                    <Markdown>{adaptedResultMarkdown}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Study Plan Generator Form */}
      <div id="ai-planner-generator" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Custom Study & Exam Plan Generator</h3>
            <p className="text-xs text-slate-500">
              Personalized based on syllabus difficulty, exam dates, active recall, and your exact daily availability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Available Daily Study Hours</label>
            <input
              type="number"
              step="0.5"
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Excluding sleep and class schedules</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Current Preparation Level</label>
            <select
              value={prepLevel}
              onChange={(e) => setPrepLevel(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="Not started / High urgency">Not started / High urgency</option>
              <option value="Moderate / Slightly Behind">Moderate / Slightly Behind</option>
              <option value="On Track / Need Exam Polish">On Track / Need Exam Polish</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <span>Generating Balanced Plan...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Full Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Generated Plan Markdown */}
        {generatedPlanMarkdown && (
          <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="font-bold text-slate-900 text-sm">Your Personalized Study Roadmap</span>
              <button
                onClick={() =>
                  onConsultAdvisor(
                    `Here is the study plan EduGuide generated for me:\n\n${generatedPlanMarkdown}\n\nCan you give me the top 3 micro-actions for Day 1?`
                  )
                }
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Discuss in Advisor Chat →
              </button>
            </div>
            <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
              <Markdown>{generatedPlanMarkdown}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
