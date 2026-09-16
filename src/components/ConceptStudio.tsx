import React, { useState } from "react";
import Markdown from "react-markdown";
import { Sparkles, BookOpen, Lightbulb, HelpCircle, CheckCircle, ArrowRight, Layers } from "lucide-react";
import { SubjectItem } from "../types";

interface ConceptStudioProps {
  subjects: SubjectItem[];
  onConsultAdvisor: (prompt: string) => void;
}

export const ConceptStudio: React.FC<ConceptStudioProps> = ({ subjects, onConsultAdvisor }) => {
  const [concept, setConcept] = useState("Dynamic Programming & Memoization");
  const [subject, setSubject] = useState(subjects[0]?.name || "Computer Science");
  const [level, setLevel] = useState("Undergraduate (2nd Year)");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const sampleConcepts = [
    { title: "Dynamic Programming Memoization", subj: "Data Structures & Algorithms" },
    { title: "Eigenvectors & Diagonalization", subj: "Linear Algebra" },
    { title: "Cache Associativity & Pipeline Hazards", subj: "Computer Systems" },
    { title: "Bayes' Theorem & Conditional Probability", subj: "Statistics" },
    { title: "Keynesian IS-LM Model", subj: "Economics" },
  ];

  const handleExplain = async (customConcept?: string, customSubj?: string) => {
    const targetConcept = customConcept || concept;
    const targetSubj = customSubj || subject;
    if (!targetConcept.trim()) return;

    setLoading(true);
    setExplanation(null);

    try {
      const response = await fetch("/api/explain-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: targetConcept,
          subject: targetSubj,
          level,
        }),
      });

      const data = await response.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch (err) {
      console.error("Failed to explain concept:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Learning Support & Concept Studio</h2>
            <p className="text-xs text-slate-500">
              Clear, step-by-step explanations, relatable analogies, and test-ready practice questions
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Concept or Topic to Master</label>
              <input
                id="input-concept-name"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Dynamic Programming, Eigenvectors, Recursion..."
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Course / Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="General Academic">General Academic</option>
              </select>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {sampleConcepts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setConcept(item.title);
                    setSubject(item.subj);
                    handleExplain(item.title, item.subj);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="btn-generate-concept-explanation"
              onClick={() => handleExplain()}
              disabled={loading || !concept.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Synthesizing Intuition...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Explain Concept & Generate Practice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Concept Breakdown */}
      {explanation && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">{concept}</h3>
            </div>
            <button
              onClick={() =>
                onConsultAdvisor(
                  `I just reviewed this concept explanation for "${concept}" in ${subject}. Can you give me 1 more challenging practice question and check my thought process?`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Practice Live with Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <Markdown>{explanation}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
