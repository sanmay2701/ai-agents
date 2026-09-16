import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, Sparkles, Coffee, Clock } from "lucide-react";
import { SubjectItem } from "../types";

interface OverwhelmedModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onAskAdvisor: (prompt: string) => void;
}

export const OverwhelmedModal: React.FC<OverwhelmedModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAskAdvisor,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isOpen) return null;

  // Find the single most urgent subject (lowest prep / highest difficulty / closest exam)
  const urgentSubject = subjects.find(
    (s) => s.status === "not_started" || s.difficulty >= 4 || s.attendancePercentage < 75
  ) || subjects[0] || { name: "Current Course", weakTopics: "most challenging chapter" };

  const actions = [
    {
      id: 1,
      title: "Pause the Spiral & Narrow the Scope",
      description: `Right now, your brain is trying to solve all courses and exams at once. Disregard everything else for the next hour except one 15-minute slice of ${urgentSubject.name}.`,
      icon: Coffee,
    },
    {
      id: 2,
      title: "Set a 20-Minute Low-Stakes Timer",
      description: `Open just one practice problem or 2 pages of notes in "${urgentSubject.weakTopics?.split(",")[0] || urgentSubject.name}". Do not pressure yourself to finish the whole subject; just engage with this single piece.`,
      icon: Clock,
    },
    {
      id: 3,
      title: "Give Yourself Permission to Take Tonight in Stages",
      description: "You do not need to make up 3 weeks of work in one night. Sustainable 45-minute blocks with 10-minute walk breaks will beat all-night panic cramming every single time.",
      icon: CheckCircle2,
    },
  ];

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAskEmergencyRelief = () => {
    onClose();
    onAskAdvisor(
      `I am feeling very overwhelmed with my courses, especially ${urgentSubject.name}. Please do not give me a huge 10-step list or long schedule. Just give me the single next 1 to 2 small, realistic things I should do in the next 60 minutes to regain control and lower my anxiety.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Take a Deep Breath</h2>
              <p className="text-xs text-slate-500">
                Let's collapse the noise into 3 manageable steps right now
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {actions.map((act) => {
            const isDone = completedSteps.includes(act.id);
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={() => toggleStep(act.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isDone
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                }`}
              >
                <div
                  className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <h3 className={`text-sm font-semibold ${isDone ? "line-through text-emerald-800" : ""}`}>
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAskEmergencyRelief}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Generate micro-plan in EduGuide AI</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <span>I've got this, close</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
