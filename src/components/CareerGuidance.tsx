import React, { useState } from "react";
import Markdown from "react-markdown";
import { Compass, Sparkles, Briefcase, Code, GraduationCap, ArrowRight } from "lucide-react";
import { StudentProfile, SubjectItem } from "../types";

interface CareerGuidanceProps {
  profile: StudentProfile;
  subjects: SubjectItem[];
  onConsultAdvisor: (prompt: string) => void;
}

export const CareerGuidance: React.FC<CareerGuidanceProps> = ({
  profile,
  subjects,
  onConsultAdvisor,
}) => {
  const [degree, setDegree] = useState(profile.degree);
  const [interests, setInterests] = useState("Software engineering, algorithms, scalable systems, and artificial intelligence");
  const [skills, setSkills] = useState("Python, Java, Git, C++, basic SQL");
  const [careerGoals, setCareerGoals] = useState("Looking for high-impact internship opportunities and evaluating industry vs research tracks");
  const [loading, setLoading] = useState(false);
  const [careerMarkdown, setCareerMarkdown] = useState<string | null>(null);

  const handleExploreCareers = async () => {
    setLoading(true);
    setCareerMarkdown(null);

    try {
      const response = await fetch("/api/career-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree,
          interests,
          skills,
          academicStrengths: subjects.map((s) => `${s.name} (${s.currentMarks}%)`).join(", "),
          careerGoals,
        }),
      });

      const data = await response.json();
      if (data.careerPaths) {
        setCareerMarkdown(data.careerPaths);
      }
    } catch (err) {
      console.error("Career guidance error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Career & Skill Pathway Explorer</h2>
            <p className="text-xs text-slate-500">
              Multi-path exploration connecting academic courses, personal strengths, and realistic industry/research roles
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Degree & Major</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Current Technical / Soft Skills</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Genuine Academic & Technical Interests</label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              placeholder="e.g. Distributed systems, web development, bio-informatics, product design..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Aspirations or Questions</label>
            <input
              type="text"
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="btn-explore-career-paths"
              onClick={handleExploreCareers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Mapping Multi-Path Options...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Explore Multiple Career Pathways</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Career Paths */}
      {careerMarkdown && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-teal-700" />
              <h3 className="text-base font-bold text-slate-900">Career & Skills Synthesis</h3>
            </div>
            <button
              onClick={() =>
                onConsultAdvisor(
                  `Based on these career pathways, can you help me choose which elective courses to register for next semester and what 1 project to start?`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
            >
              <span>Discuss Electives with Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
            <Markdown>{careerMarkdown}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
