function calculateGrade(obtainedMarks, maxMarks) {
  const obt = Number(obtainedMarks) || 0;
  const max = Number(maxMarks) || 40;
  const pct = max > 0 ? (obt / max) * 100 : 0;

  let grade = 'F';
  let gradePoint = 0;

  if (pct >= 90) { grade = 'O'; gradePoint = 10; }
  else if (pct >= 80) { grade = 'A+'; gradePoint = 9; }
  else if (pct >= 70) { grade = 'A'; gradePoint = 8; }
  else if (pct >= 60) { grade = 'B+'; gradePoint = 7; }
  else if (pct >= 50) { grade = 'B'; gradePoint = 6; }
  else if (pct >= 40) { grade = 'C'; gradePoint = 5; }

  const credit = 4;
  const creditPoint = gradePoint * credit;

  return {
    obt,
    max,
    grade,
    gradePoint,
    credit,
    creditPoint
  };
}

module.exports = { calculateGrade };
