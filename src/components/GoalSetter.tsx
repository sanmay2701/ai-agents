import React, { useState } from "react";
import Markdown from "react-markdown";
import { Target, Sparkles, ArrowRight, CheckCircle2, TrendingUp, Compass } from "lucide-react";
import { StudentProfile, SubjectItem } from "../types";

interface GoalSetterProps {
  profile: StudentProfile;
  subjects: SubjectItem[];
  onConsultAdvisor: (prompt: string) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ profile, subjects, onConsultAdvisor }) => {
  const [rawGoal, setRawGoal] = useState("I want to raise my marks in Linear Algebra and Data Structures to get above a 3.6 GPA.");
  const [targetTimeframe, setTargetTimeframe] = useState("This Semester (Finals in 4-6 weeks)");
  const [loading, setLoading] = useState(false);
  const [structuredGoalMarkdown, setStructuredGoalMarkdown] = useState<string | null>(null);

  const sampleGoals = [
    "I want better marks in my difficult courses",
    "I want to pass my math final without panicking",
    "I want to increase my GPA from 3.1 to 3.65",
    "I want to be consistent with daily 2-hour study blocks",
  ];

  const handleTransformGoal = async () => {
    if (!rawGoal.trim()) return;

    setLoading(true);
    setStructuredGoalMarkdown(null);

    try {
      const response = await fetch("/api/goal-transformer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawGoal,
          currentGpa: profile.currentGpa,
          targetGpa: profile.targetGpa,
          timeframe: targetTimeframe,
        }),
      });

      const data = await response.json();
      if (data.structuredGoal) {
        setStructuredGoalMarkdown(data.structuredGoal);
      }
    } catch (err) {
      console.error("Goal transformation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">SMART Goal Transformer</h2>
            <p className="text-xs text-slate-500">
              Convert vague wishes ("I want better grades") into quantified, measurable milestone roadmaps
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mt-5 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700">What is your current academic goal?</label>
            <textarea
              value={rawGoal}
              onChange={(e) => setRawGoal(e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
              placeholder="e.g. I want to improve my grades and not feel stressed before exams"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Timeframe</label>
              <input
                type="text"
                value={targetTimeframe}
                onChange={(e) => setTargetTimeframe(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Target GPA / Mark Benchmark</label>
              <input
                type="text"
                value={profile.targetGpa}
                readOnly
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-xl text-slate-600"
              />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Common Goals to Convert:
            </span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {sampleGoals.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setRawGoal(sample)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleTransformGoal}
              disabled={loading || !rawGoal.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Structuring Action Plan...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Transform into Measurable Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {structuredGoalMarkdown && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Quantified Action Roadmap</h3>
            </div>
            <button
              onClick={() =>
                onConsultAdvisor(
                  `Here is my structured SMART academic goal roadmap:\n\n${structuredGoalMarkdown}\n\nHelp me execute Stage 1 this week with specific daily times.`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
            >
              <span>Commit to Advisor Chat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <Markdown>{structuredGoalMarkdown}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
