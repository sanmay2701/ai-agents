/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { OverwhelmedModal } from "./components/OverwhelmedModal";
import { AdvisorChat } from "./components/AdvisorChat";
import { AcademicTracker } from "./components/AcademicTracker";
import { StudyPlanner } from "./components/StudyPlanner";
import { ConceptStudio } from "./components/ConceptStudio";
import { GoalSetter } from "./components/GoalSetter";
import { CareerGuidance } from "./components/CareerGuidance";
import { initialProfile, initialSubjects, initialSessions } from "./data/initialData";
import { StudentProfile, SubjectItem, StudySessionItem, ChatMessage, ActiveTab } from "./types";
import { detectAcademicRisks } from "./utils/academicAnalytics";

export default function App() {
  // Local storage loaded or defaults
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("eduguide_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialProfile;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem("eduguide_subjects");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSubjects;
  });

  const [sessions, setSessions] = useState<StudySessionItem[]>(() => {
    const saved = localStorage.getItem("eduguide_sessions");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSessions;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "welcome-1",
        role: "assistant",
        content: `👋 Hello ${profile.name.split(" ")[0]}! I am **EduGuide AI**, your personal Academic Advisor.\n\nMy purpose is to help university and college students understand their academic standing and make realistic, sustainable decisions without anxiety.\n\nHere is how I can support you today:\n1. 📅 **Study & Exam Planning**: Create realistic schedules protecting your sleep and breaks.\n2. 📊 **Performance & Math Analysis**: Understand your score deficits and attendance margins.\n3. 🚨 **Risk Detection**: Identify upcoming deadlines, exam urgency, or institutional attendance limits.\n4. 💡 **Learning Support**: Explain difficult concepts with intuitive analogies and practice questions.\n5. 🎯 **SMART Goal Transformation**: Turn vague hopes into 4-stage action roadmaps.\n6. 🧭 **Career & Skill Paths**: Explore distinct career trajectories based on your degree.\n7. 🔄 **Adaptive Rescheduling**: If you missed study time or fell behind, I will adapt your plan without judgment.\n\nFeel free to ask a question, select a prompt below, or use the dedicated tabs above!`,
        timestamp: Date.now(),
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("advisor");
  const [isOverwhelmedOpen, setIsOverwhelmedOpen] = useState(false);
  const [pendingAdvisorPrompt, setPendingAdvisorPrompt] = useState<string | undefined>(undefined);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem("eduguide_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("eduguide_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("eduguide_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Detected risks
  const detectedRisks = useMemo(() => detectAcademicRisks(subjects), [subjects]);
  const criticalRisksCount = useMemo(
    () => detectedRisks.filter((r) => r.severity === "critical").length,
    [detectedRisks]
  );

  const handleConsultAdvisor = (promptText: string) => {
    setPendingAdvisorPrompt(promptText);
    setActiveTab("advisor");
  };

  const handleConsultSubject = (subjectName: string, promptText: string) => {
    setPendingAdvisorPrompt(`Regarding ${subjectName}: ${promptText}`);
    setActiveTab("advisor");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Global Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOverwhelmed={() => setIsOverwhelmedOpen(true)}
        criticalRisksCount={criticalRisksCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "advisor" && (
          <AdvisorChat
            messages={messages}
            setMessages={setMessages}
            profile={profile}
            subjects={subjects}
            criticalRisksCount={criticalRisksCount}
            initialPrompt={pendingAdvisorPrompt}
            onClearInitialPrompt={() => setPendingAdvisorPrompt(undefined)}
          />
        )}

        {activeTab === "tracker" && (
          <AcademicTracker
            subjects={subjects}
            setSubjects={setSubjects}
            profile={profile}
            setProfile={setProfile}
            risks={detectedRisks}
            onConsultSubject={handleConsultSubject}
          />
        )}

        {activeTab === "planner" && (
          <StudyPlanner
            sessions={sessions}
            setSessions={setSessions}
            subjects={subjects}
            profile={profile}
            onConsultAdvisor={handleConsultAdvisor}
          />
        )}

        {activeTab === "concept_studio" && (
          <ConceptStudio
            subjects={subjects}
            onConsultAdvisor={handleConsultAdvisor}
          />
        )}

        {activeTab === "goals" && (
          <GoalSetter
            profile={profile}
            subjects={subjects}
            onConsultAdvisor={handleConsultAdvisor}
          />
        )}

        {activeTab === "careers" && (
          <CareerGuidance
            profile={profile}
            subjects={subjects}
            onConsultAdvisor={handleConsultAdvisor}
          />
        )}
      </main>

      {/* Anxiety Relief / Overwhelmed Modal */}
      <OverwhelmedModal
        isOpen={isOverwhelmedOpen}
        onClose={() => setIsOverwhelmedOpen(false)}
        subjects={subjects}
        onAskAdvisor={handleConsultAdvisor}
      />
    </div>
  );
}
