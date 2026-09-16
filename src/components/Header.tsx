import React from "react";
import { GraduationCap, ShieldAlert, HeartHandshake, Sparkles } from "lucide-react";
import { StudentProfile, ActiveTab } from "../types";

interface HeaderProps {
  profile: StudentProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenOverwhelmed: () => void;
  criticalRisksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenOverwhelmed,
  criticalRisksCount,
}) => {
  const tabs = [
    { id: "advisor" as ActiveTab, label: "EduGuide Advisor", icon: GraduationCap },
    { id: "tracker" as ActiveTab, label: "Performance & Risk Radar", icon: ShieldAlert, badge: criticalRisksCount > 0 ? criticalRisksCount : null },
    { id: "planner" as ActiveTab, label: "Study & Adaptive Planner", icon: Sparkles },
    { id: "concept_studio" as ActiveTab, label: "Concept Studio", icon: Sparkles },
    { id: "goals" as ActiveTab, label: "SMART Goals", icon: Sparkles },
    { id: "careers" as ActiveTab, label: "Career Pathways", icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">EduGuide AI</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Academic Advisor
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personalized, achievable guidance for university & college students
              </p>
            </div>
          </div>

          {/* Student Status & Overwhelmed Button */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">{profile.name}</span>
              <span className="text-slate-300">•</span>
              <span>{profile.degree}</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-blue-700">GPA: {profile.currentGpa}</span>
            </div>

            <button
              id="btn-overwhelmed-quick"
              onClick={onOpenOverwhelmed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shadow-xs"
              title="Feeling stressed? Get instant 1-3 simple actions"
            >
              <HeartHandshake className="h-4 w-4 text-amber-700" />
              <span>Overwhelmed? 3 Next Steps</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 pt-1 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
