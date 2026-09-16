import { SubjectItem, AcademicRisk } from "../types";

export interface GradeCalculationDetail {
  subjectName: string;
  currentMarks: number;
  targetMarks: number;
  weightageRemaining: number;
  currentContribution: number;
  requiredExamScore: number;
  isFeasible: boolean;
  notes: string;
}

export function calculateRequiredScore(subject: SubjectItem): GradeCalculationDetail {
  const currentMarks = Number(subject.currentMarks) || 0;
  const targetMarks = Number(subject.targetMarks) || 75;
  const weightRemaining = Number(subject.weightageRemaining) || 50; // percentage
  const weightCompleted = 100 - weightRemaining;

  // Provided data
  const currentEarnedPoints = (currentMarks * weightCompleted) / 100;
  const targetTotalPoints = targetMarks;
  const neededRemainingPoints = targetTotalPoints - currentEarnedPoints;
  const requiredScorePercentage = (neededRemainingPoints / weightRemaining) * 100;

  const isFeasible = requiredScorePercentage <= 100;

  let notes = "";
  if (requiredScorePercentage > 100) {
    notes = `Targeting ${targetMarks}% requires ${requiredScorePercentage.toFixed(1)}% on remaining components, which exceeds 100%. Consider adjusting the target to ${(currentEarnedPoints + weightRemaining).toFixed(0)}% or asking your instructor for extra credit opportunities.`;
  } else if (requiredScorePercentage >= 85) {
    notes = `Requires a high performance of ${requiredScorePercentage.toFixed(1)}% on remaining finals/assignments. High priority focus needed.`;
  } else if (requiredScorePercentage >= 70) {
    notes = `Achievable with consistent practice: need ${requiredScorePercentage.toFixed(1)}% on remaining tests.`;
  } else {
    notes = `Safe margin: currently on track to reach target with ${Math.max(0, requiredScorePercentage).toFixed(1)}% on remainder.`;
  }

  return {
    subjectName: subject.name,
    currentMarks,
    targetMarks,
    weightageRemaining: weightRemaining,
    currentContribution: Number(currentEarnedPoints.toFixed(1)),
    requiredExamScore: Number(requiredScorePercentage.toFixed(1)),
    isFeasible,
    notes,
  };
}

export function detectAcademicRisks(subjects: SubjectItem[]): AcademicRisk[] {
  const risks: AcademicRisk[] = [];
  const today = new Date();

  subjects.forEach((subj) => {
    // 1. Attendance Risks
    if (subj.attendancePercentage < 75) {
      risks.push({
        id: `att-crit-${subj.id}`,
        type: "attendance",
        severity: "critical",
        subjectName: subj.name,
        title: `Debarment Warning: Attendance at ${subj.attendancePercentage}% (<75%)`,
        description: `Most universities enforce a minimum 75% or 80% attendance mandate to sit for the final exam. Being at ${subj.attendancePercentage}% puts you at risk of academic debarment or grade penalties.`,
        actionableSteps: [
          `Do not miss any upcoming lectures or labs in ${subj.name}.`,
          `Calculate how many consecutive classes you must attend to cross 75%.`,
          `Meet your professor or academic advisor during office hours this week with any legitimate medical/absence documentation.`,
        ],
      });
    } else if (subj.attendancePercentage < 80) {
      risks.push({
        id: `att-mod-${subj.id}`,
        type: "attendance",
        severity: "moderate",
        subjectName: subj.name,
        title: `Borderline Attendance: ${subj.attendancePercentage}%`,
        description: `Attendance is nearing the critical threshold. Missing 1-2 more classes could trigger institutional warnings.`,
        actionableSteps: [
          `Treat every upcoming session as mandatory.`,
          `Set calendar reminders 30 minutes before lecture time.`,
        ],
      });
    }

    // 2. Exam Proximity & Prep Level Risk
    if (subj.examDate) {
      const examDateObj = new Date(subj.examDate);
      const diffTime = examDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 10 && subj.status === "not_started") {
        risks.push({
          id: `exam-urgent-${subj.id}`,
          type: "insufficient_prep" as any,
          severity: "critical",
          subjectName: subj.name,
          title: `Exam in ${diffDays} Days with Prep 'Not Started'`,
          description: `You have an exam in ${diffDays} days for ${subj.name} (Difficulty ${subj.difficulty}/5) but haven't begun systematic preparation.`,
          actionableSteps: [
            `Identify the top 3 highest-weightage chapters from the syllabus today.`,
            `Schedule two 90-minute study blocks starting tomorrow morning.`,
            `Solve at least 1 previous year question paper to diagnose exact knowledge gaps.`,
          ],
        });
      } else if (diffDays >= 0 && diffDays <= 7 && subj.status === "in_progress" && subj.difficulty >= 4) {
        risks.push({
          id: `exam-high-diff-${subj.id}`,
          type: "deadline",
          severity: "moderate",
          subjectName: subj.name,
          title: `Challenging Final in ${diffDays} Days: ${subj.name}`,
          description: `This course has a high difficulty rating (${subj.difficulty}/5). Time should be shifted from confident subjects to this course.`,
          actionableSteps: [
            `Double down on identified weak areas: ${subj.weakTopics || 'core problem sets'}.`,
            `Shift into timed exam conditions rather than passive textbook reading.`,
          ],
        });
      }
    }

    // 3. Performance Deficit Risk
    const calc = calculateRequiredScore(subj);
    if (!calc.isFeasible) {
      risks.push({
        id: `calc-unfeasible-${subj.id}`,
        type: "performance_deficit",
        severity: "critical",
        subjectName: subj.name,
        title: `Target Grade Mathematically Unfeasible (${calc.requiredExamScore}% needed)`,
        description: `With your current score of ${subj.currentMarks}% and ${subj.weightageRemaining}% remaining weightage, reaching ${subj.targetMarks}% is mathematically impossible without bonus marks.`,
        actionableSteps: [
          `Recalibrate target to a realistic, motivating benchmark (e.g. ${Math.min(90, Math.floor(calc.currentContribution + (subj.weightageRemaining || 50)))}%).`,
          `Discuss potential extra credit or grade replacement policies with your instructor.`,
          `Focus on maximizing marks on the final 50% rather than feeling discouraged.`,
        ],
      });
    } else if (calc.requiredExamScore >= 88 && subj.difficulty >= 4) {
      risks.push({
        id: `calc-steep-${subj.id}`,
        type: "performance_deficit",
        severity: "moderate",
        subjectName: subj.name,
        title: `Steep Target Requirement (${calc.requiredExamScore}% needed in final)`,
        description: `You need to score ${calc.requiredExamScore}% in remaining assessments to meet your ${subj.targetMarks}% target in ${subj.name}.`,
        actionableSteps: [
          `Prioritize high-yield past exam questions over reading textbook chapters.`,
          `Attend teaching assistant (TA) office hours for your weak topics: ${subj.weakTopics || 'problem sets'}.`,
        ],
      });
    }
  });

  return risks;
}
