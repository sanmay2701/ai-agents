import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Clock
} from "lucide-react";
import { SubjectItem, StudentProfile, AcademicRisk } from "../types";
import { calculateRequiredScore, GradeCalculationDetail } from "../utils/academicAnalytics";

interface AcademicTrackerProps {
  subjects: SubjectItem[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectItem[]>>;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  risks: AcademicRisk[];
  onConsultSubject: (subjectName: string, promptText: string) => void;
}

export const AcademicTracker: React.FC<AcademicTrackerProps> = ({
  subjects,
  setSubjects,
  profile,
  setProfile,
  risks,
  onConsultSubject,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState<Partial<SubjectItem>>({
    name: "",
    code: "",
    credits: 3,
    currentMarks: 70,
    targetMarks: 85,
    attendancePercentage: 85,
    difficulty: 3,
    status: "in_progress",
    weakTopics: "",
    weightageRemaining: 40,
    examDate: "",
  });
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Math breakdown modal
  const [selectedCalc, setSelectedCalc] = useState<GradeCalculationDetail | null>(null);

  // Stats
  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const avgMarks = subjects.length
    ? (subjects.reduce((sum, s) => sum + (Number(s.currentMarks) || 0), 0) / subjects.length).toFixed(1)
    : "0";
  const avgAttendance = subjects.length
    ? (subjects.reduce((sum, s) => sum + (Number(s.attendancePercentage) || 0), 0) / subjects.length).toFixed(1)
    : "0";
  const criticalRisks = risks.filter((r) => r.severity === "critical");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileForm);
    setEditingProfile(false);
  };

  const handleOpenSubjectModal = (subj?: SubjectItem) => {
    if (subj) {
      setEditingSubjectId(subj.id);
      setSubjectForm(subj);
    } else {
      setEditingSubjectId(null);
      setSubjectForm({
        name: "",
        code: "",
        credits: 3,
        currentMarks: 70,
        targetMarks: 85,
        attendancePercentage: 85,
        difficulty: 3,
        status: "in_progress",
        weakTopics: "",
        weightageRemaining: 40,
        examDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name?.trim()) return;

    if (editingSubjectId) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === editingSubjectId ? ({ ...s, ...subjectForm } as SubjectItem) : s))
      );
    } else {
      const newSubject: SubjectItem = {
        id: `subj-${Date.now()}`,
        name: subjectForm.name || "New Course",
        code: subjectForm.code || "",
        credits: Number(subjectForm.credits) || 3,
        currentMarks: Number(subjectForm.currentMarks) || 0,
        targetMarks: Number(subjectForm.targetMarks) || 75,
        attendancePercentage: Number(subjectForm.attendancePercentage) || 85,
        difficulty: Number(subjectForm.difficulty) || 3,
        status: subjectForm.status || "in_progress",
        weakTopics: subjectForm.weakTopics || "",
        weightageRemaining: Number(subjectForm.weightageRemaining) || 40,
        examDate: subjectForm.examDate || "",
      };
      setSubjects((prev) => [...prev, newSubject]);
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Academic Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA & Standing */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Standing</span>
            <button
              onClick={() => {
                setProfileForm(profile);
                setEditingProfile(true);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Edit Profile
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{profile.currentGpa}</span>
            <span className="text-xs text-slate-500">GPA (Target: {profile.targetGpa})</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">{profile.degree} • {profile.yearSemester}</p>
        </div>

        {/* Current Average Marks */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Course Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgMarks}%</span>
            <span className="text-xs text-slate-500">across {subjects.length} courses</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{totalCredits} total semester credit hours</p>
        </div>

        {/* Attendance Health */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <Clock className={`h-4 w-4 ${Number(avgAttendance) < 80 ? "text-amber-500" : "text-emerald-600"}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${Number(avgAttendance) < 75 ? "text-rose-600" : Number(avgAttendance) < 80 ? "text-amber-600" : "text-slate-900"}`}>
              {avgAttendance}%
            </span>
            <span className="text-xs text-slate-500">threshold: 75%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {Number(avgAttendance) >= 80 ? "Safely above debarment limit" : "Caution: Close to institutional limit"}
          </p>
        </div>

        {/* Risk Radar Summary */}
        <div className={`rounded-xl p-4 border shadow-2xs ${
          criticalRisks.length > 0 ? "bg-rose-50/70 border-rose-200" : "bg-emerald-50/70 border-emerald-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Academic Risk Radar</span>
            {criticalRisks.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${criticalRisks.length > 0 ? "text-rose-700" : "text-emerald-700"}`}>
              {criticalRisks.length} Critical
            </span>
            <span className="text-xs text-slate-600">{risks.length} total flags</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {criticalRisks.length > 0 ? "Action required to avoid penalties" : "All subjects within safe operating zones"}
          </p>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Student Academic Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Degree & Major</label>
                <input
                  type="text"
                  value={profileForm.degree}
                  onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Year / Term</label>
                  <input
                    type="text"
                    value={profileForm.yearSemester}
                    onChange={(e) => setProfileForm({ ...profileForm, yearSemester: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Weekly Study Hours</label>
                  <input
                    type="number"
                    value={profileForm.weeklyStudyHours}
                    onChange={(e) => setProfileForm({ ...profileForm, weeklyStudyHours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Current GPA</label>
                  <input
                    type="text"
                    value={profileForm.currentGpa}
                    onChange={(e) => setProfileForm({ ...profileForm, currentGpa: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target GPA</label>
                  <input
                    type="text"
                    value={profileForm.targetGpa}
                    onChange={(e) => setProfileForm({ ...profileForm, targetGpa: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Risk Radar (Explicitly details issues & practical next steps) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Academic Risk Detection</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated pattern detection for upcoming deadlines, grade deficits, attendance concerns, and study load
            </p>
          </div>
          <button
            onClick={() =>
              onConsultSubject(
                "All Courses",
                "Please perform an in-depth academic risk audit on my courses, calculate my needed scores, and outline a step-by-step mitigation roadmap."
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Audit All with EduGuide AI</span>
          </button>
        </div>

        {risks.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">No active academic risks detected</p>
            <p className="text-xs text-slate-500 mt-1">Your attendance, deadlines, and grade trajectories are all in healthy standing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className={`rounded-xl p-4 border flex flex-col justify-between ${
                  risk.severity === "critical"
                    ? "bg-rose-50/50 border-rose-200"
                    : "bg-amber-50/50 border-amber-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        risk.severity === "critical"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {risk.severity} Alert
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{risk.subjectName}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{risk.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{risk.description}</p>

                  {/* Actionable Next Steps */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Practical Next Steps:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {risk.actionableSteps.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="font-bold text-blue-600 mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-end">
                  <button
                    onClick={() =>
                      onConsultSubject(
                        risk.subjectName,
                        `I need immediate help with this risk: ${risk.title}. Specifically in ${risk.subjectName}: ${risk.description}. What are the next 3 actionable steps I should take?`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Consult Advisor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Courses & Detailed Performance Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrolled Courses & Performance Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track marks, attendance, exam dates, difficulty ratings, and required final exam scores
            </p>
          </div>
          <button
            id="btn-add-subject"
            onClick={() => handleOpenSubjectModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {subjects.map((subj) => {
            const calc = calculateRequiredScore(subj);
            const isAttendanceLow = subj.attendancePercentage < 75;
            const isAttendanceBorderline = subj.attendancePercentage >= 75 && subj.attendancePercentage < 80;

            return (
              <div
                key={subj.id}
                className="bg-slate-50/60 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {subj.code || "Course"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{subj.credits} Credits</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            subj.status === "confident"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : subj.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {subj.status === "confident"
                            ? "Confident"
                            : subj.status === "in_progress"
                            ? "In Progress"
                            : "Needs Focus"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{subj.name}</h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenSubjectModal(subj)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                        title="Edit course details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subj.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/70 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Current Score</span>
                      <span className="text-base font-bold text-slate-900">{subj.currentMarks}%</span>
                      <span className="text-[10px] text-slate-400 block">Target: {subj.targetMarks}%</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Attendance</span>
                      <span
                        className={`text-base font-bold ${
                          isAttendanceLow
                            ? "text-rose-600"
                            : isAttendanceBorderline
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {subj.attendancePercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {isAttendanceLow ? "At Risk (<75%)" : "Good"}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Difficulty</span>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <span
                            key={lvl}
                            className={`h-2 w-3 rounded-xs ${
                              lvl <= subj.difficulty ? "bg-amber-500" : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Level {subj.difficulty}/5</span>
                    </div>
                  </div>

                  {/* Weak Topics */}
                  {subj.weakTopics && (
                    <div className="mt-3 text-xs">
                      <span className="font-semibold text-slate-700">Improvement Areas: </span>
                      <span className="text-slate-600">{subj.weakTopics}</span>
                    </div>
                  )}

                  {/* Required Exam Score Calculation Highlight */}
                  <div
                    onClick={() => setSelectedCalc(calc)}
                    className="mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 cursor-pointer hover:bg-blue-100/60 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="font-semibold text-blue-900">
                          Final Exam Target: {calc.requiredExamScore}% needed
                        </span>
                        <span className="block text-[11px] text-blue-700">
                          on remaining {subj.weightageRemaining || 50}% weightage
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-blue-700 underline flex items-center gap-0.5">
                      Show Math
                      <Info className="h-3 w-3" />
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {subj.examDate
                        ? `Exam: ${new Date(subj.examDate).toLocaleDateString()}`
                        : "Exam date pending"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      onConsultSubject(
                        subj.name,
                        `I need advice for ${subj.name} (${subj.code}). My current mark is ${subj.currentMarks}%, target is ${subj.targetMarks}%, attendance is ${subj.attendancePercentage}%, and my weak areas are: ${subj.weakTopics}. What should my concrete study strategy be?`
                      )
                    }
                    className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Ask EduGuide AI</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingSubjectId ? "Edit Course Details" : "Add New Course"}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Course Name *</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Course Code</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="CS 201"
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Credits</label>
                  <input
                    type="number"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Current Score (%)</label>
                  <input
                    type="number"
                    value={subjectForm.currentMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, currentMarks: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Score (%)</label>
                  <input
                    type="number"
                    value={subjectForm.targetMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, targetMarks: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Attendance (%)</label>
                  <input
                    type="number"
                    value={subjectForm.attendancePercentage}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, attendancePercentage: Number(e.target.value) })
                    }
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Remaining Weight (%)</label>
                  <input
                    type="number"
                    value={subjectForm.weightageRemaining}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, weightageRemaining: Number(e.target.value) })
                    }
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Difficulty (1-5)</label>
                  <select
                    value={subjectForm.difficulty}
                    onChange={(e) => setSubjectForm({ ...subjectForm, difficulty: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Challenging</option>
                    <option value={5}>5 - Very Difficult</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Upcoming Exam Date</label>
                  <input
                    type="date"
                    value={subjectForm.examDate}
                    onChange={(e) => setSubjectForm({ ...subjectForm, examDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Current Prep Status</label>
                  <select
                    value={subjectForm.status}
                    onChange={(e) => setSubjectForm({ ...subjectForm, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="not_started">Not Started Yet</option>
                    <option value="in_progress">In Progress</option>
                    <option value="confident">Confident / Reviewing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Weak Topics / Improvement Areas</label>
                <textarea
                  value={subjectForm.weakTopics}
                  onChange={(e) => setSubjectForm({ ...subjectForm, weakTopics: e.target.value })}
                  placeholder="e.g. Dynamic Programming, Graph Dijkstra algorithm"
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {editingSubjectId ? "Save Updates" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Math Calculation Transparency Drawer/Modal (Satisfies strict requirement) */}
      {selectedCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Score Calculation Breakdown</h3>
                  <p className="text-xs text-slate-500">{selectedCalc.subjectName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCalc(null)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Provided Data Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] mb-1.5 text-blue-700">
                  1. Provided Data (Actuals)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Current Score:</span>{" "}
                    <span className="font-semibold">{selectedCalc.currentMarks}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Score:</span>{" "}
                    <span className="font-semibold">{selectedCalc.targetMarks}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Completed Weightage:</span>{" "}
                    <span className="font-semibold">{100 - selectedCalc.weightageRemaining}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Remaining Weightage:</span>{" "}
                    <span className="font-semibold">{selectedCalc.weightageRemaining}%</span>
                  </div>
                </div>
              </div>

              {/* Calculated Projections Section */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px] mb-1.5 text-blue-700">
                  2. Mathematical Projections
                </span>
                <div className="space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Points earned so far:</span>
                    <span className="font-semibold">{selectedCalc.currentContribution} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Points needed for target:</span>
                    <span className="font-semibold">{selectedCalc.targetMarks} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Points needed on remaining tests:</span>
                    <span className="font-semibold">
                      {(selectedCalc.targetMarks - selectedCalc.currentContribution).toFixed(1)} pts
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex justify-between text-sm">
                    <span className="font-bold text-blue-900">Required Exam Score:</span>
                    <span
                      className={`font-extrabold ${
                        selectedCalc.requiredExamScore > 100
                          ? "text-rose-600"
                          : selectedCalc.requiredExamScore > 85
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {selectedCalc.requiredExamScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Advisor Note */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="font-bold text-slate-900 block mb-1">Advisor Evaluation:</span>
                <p className="text-slate-600 leading-relaxed">{selectedCalc.notes}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedCalc(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
