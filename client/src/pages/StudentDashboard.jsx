import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { usePortal } from '../context/PortalContext';
import { RefreshCw, Search, GraduationCap } from 'lucide-react';

export const StudentDashboard = () => {
  const { currentUser, marks } = usePortal();
  const marksheetRef = useRef(null);

  // View state: default to false (DU Result Search Form), true when search submitted
  const [showMarksheet, setShowMarksheet] = useState(false);

  // Form State
  const [college, setCollege] = useState('School of Open Learning');
  const [session, setSession] = useState('Nov-Dec 2025');
  const [rollNo, setRollNo] = useState(currentUser?.rollNo || '23345227188');
  const [dobDay, setDobDay] = useState('15');
  const [dobMonth, setDobMonth] = useState('08');
  const [dobYear, setDobYear] = useState('2004');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('176588');

  const refreshCaptcha = () => {
    const randomCaptcha = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(randomCaptcha);
  };

  const [captchaError, setCaptchaError] = useState('');

  const [dbMarks, setDbMarks] = useState([]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput.trim() !== captchaCode.trim()) {
      setCaptchaError('Invalid Captcha Code! Please enter correct code.');
      return;
    }
    setCaptchaError('');
    
    // Fetch live student marks from MySQL Database API
    try {
      const API_BASE = import.meta.env.PROD ? 'https://sol-results.onrender.com' : '';
      const res = await fetch(`${API_BASE}/api/marks/student/${rollNo || '23345227188'}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setDbMarks(data);
      }
    } catch (err) {
      console.log('Using default marks structure for student view:', err.message);
    }

    setShowMarksheet(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const studentRollNo = rollNo || '';

  // Dynamic Paper List constructed purely from Database Records
  const paperList = dbMarks.map((m, idx) => ({
    sr: idx + 1,
    code: m.paperCode,
    name: m.paperName,
    type: m.paperType || 'DSC',
    sem: m.sem,
    credit: m.credit || 4,
    th: m.thGrade || (m.thObt > 50 ? 'A' : 'B+'),
    tu: m.tuGrade || (m.tuObt > 15 ? 'O' : 'A'),
    pr: m.prGrade || (m.prObt > 25 ? 'O' : '-'),
    net: m.netGrade || 'A',
    point: m.gradePoint || 8,
    creditPoint: m.creditPoint || 32
  }));

  // Real-time automatic SGPA / CGPA Calculation Engine from Database Records
  const calculateSgpaTable = () => {
    if (!dbMarks || dbMarks.length === 0) {
      return [
        { sem: 'I', credit: 22, point: 146, sgpa: '6.64', result: 'PASSED', cgpa: '' },
        { sem: 'II', credit: 22, point: 152, sgpa: '6.91', result: 'PASSED', cgpa: '6.77' },
        { sem: 'III', credit: 22, point: 144, sgpa: '6.55', result: 'PASSED', cgpa: '' },
        { sem: 'IV', credit: 22, point: 146, sgpa: '6.64', result: 'PASSED', cgpa: '6.59' },
        { sem: 'V', credit: 22, point: 156, sgpa: '7.09', result: 'PASSED', cgpa: '6.77' }
      ];
    }

    // Group database marks by semester
    const semMap = {};
    dbMarks.forEach(m => {
      const s = m.sem || 'I';
      if (!semMap[s]) semMap[s] = { credit: 0, creditPoint: 0 };
      const cr = Number(m.credit || 4);
      const cp = Number(m.creditPoint || (cr * (m.gradePoint || 8)));
      semMap[s].credit += cr;
      semMap[s].creditPoint += cp;
    });

    let cumulativeCredit = 0;
    let cumulativePoint = 0;

    return Object.keys(semMap).map(s => {
      const semData = semMap[s];
      const sgpaVal = (semData.creditPoint / (semData.credit || 1)).toFixed(2);
      cumulativeCredit += semData.credit;
      cumulativePoint += semData.creditPoint;
      const cgpaVal = (cumulativePoint / (cumulativeCredit || 1)).toFixed(2);
      
      return {
        sem: s,
        credit: semData.credit,
        point: semData.creditPoint,
        sgpa: sgpaVal,
        result: 'PASSED',
        cgpa: cgpaVal
      };
    });
  };

  const computedSgpaTable = calculateSgpaTable();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900 font-sans">

      {/* Mode A: Marksheet View */}
      {showMarksheet ? (
        <>
          {/* High-Resolution DU Marksheet Canvas */}
          <div className="w-full flex justify-center overflow-x-auto p-2">
            <div 
              ref={marksheetRef} 
              className="printable-marksheet bg-white p-6 md:p-8 rounded-xl border-2 border-slate-400 shadow-2xl w-full max-w-[850px] space-y-4 relative"
              style={{ fontFamily: 'Verdana, Arial, sans-serif', color: '#000000' }}
            >
              {/* 1. Header Table */}
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="w-[20%] text-left align-top">
                      <img 
                        src="/University_of_Delhi.png" 
                        alt="University of Delhi Logo" 
                        className="h-20 w-auto object-contain"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <h2 className="text-2xl font-bold text-maroon-800" style={{ color: '#800000', fontSize: '24px', fontWeight: 'bold' }}>
                        University of Delhi
                      </h2>
                      <p className="text-sm font-bold mt-0.5" style={{ color: '#800000', fontSize: '14px' }}>
                        Semester Examination {session}
                      </p>
                    </td>
                    <td className="w-[25%] text-right align-top">
                      <div className="inline-block text-center">
                        <img 
                          src="/new_logo.png" 
                          alt="School of Open Learning SOL Logo" 
                          className="h-24 w-auto object-contain ml-auto"
                        />
                        <span className="text-[11px] font-mono text-maroon-800 font-bold block mt-1" style={{ color: '#800000' }}>
                          DVFNO: {String(studentRollNo || '23345227188').slice(-6)}833
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Blue Line Divider */}
              <div className="w-full h-0.5 bg-blue-700 my-1"></div>

              {/* 2. Statement of Marks/Grades Banner */}
              <div className="text-center py-1">
                <span className="text-lg font-bold" style={{ color: '#800000', fontSize: '16px' }}>
                  Statement of Marks/Grades
                </span>
              </div>

              {/* Blue Line Divider */}
              <div className="w-full h-0.5 bg-blue-700 my-1"></div>

              {/* Date of Printing */}
              <div className="text-right text-[11px]" style={{ color: '#800000' }}>
                Date of Printing: {new Date().toLocaleDateString('en-GB', { day: '02-digit', month: 'short', year: 'numeric' })}
              </div>

              {/* 3. Student Details Table */}
              <table className="w-full text-xs border-collapse" style={{ fontSize: '12px', color: '#000000' }}>
                <tbody>
                  <tr>
                    <td className="w-[20%] py-1 font-semibold text-slate-700">Exam Roll No.</td>
                    <td className="py-1"><strong className="text-slate-900" style={{ color: '#800000', fontWeight: 'bold' }}>: {studentRollNo}</strong></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Name</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{currentUser?.name || (dbMarks[0]?.studentName) || 'STUDENT CANDIDATE'}</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Father's Name</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{currentUser?.fatherName || 'DU Enrolled Parent'}</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Mother's Name</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>NA</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Enrollment No.</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{currentUser?.enrollmentNo || `23SOL${studentRollNo}`}</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Course Name</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{currentUser?.course || (dbMarks[0]?.course) || '(NEP) B.A. (PROGRAMME)'}</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">Semester</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{currentUser?.semester || (dbMarks[0]?.sem) || 'V'}</span></td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-700">College Name</td>
                    <td className="py-1">: <span style={{ color: '#800000' }}>{college}</span></td>
                  </tr>
                </tbody>
              </table>

              {/* 4. Full 34 Paper Table */}
              <div className="w-full overflow-x-auto my-2 border border-slate-400 rounded-lg">
                <table className="w-full border-collapse text-[9px] sm:text-[11px] min-w-[650px]" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold">
                      <th className="border border-slate-400 p-1 text-center">Sr. No.</th>
                      <th className="border border-slate-400 p-1 text-center">Paper Code</th>
                      <th className="border border-slate-400 p-1 text-center">-</th>
                      <th className="border border-slate-400 p-1 text-left">Paper Name</th>
                      <th className="border border-slate-400 p-1 text-center">Paper Type</th>
                      <th className="border border-slate-400 p-1 text-center">Sem</th>
                      <th className="border border-slate-400 p-1 text-center">Credit</th>
                      <th className="border border-slate-400 p-1 text-center">Grade (TH)</th>
                      <th className="border border-slate-400 p-1 text-center">Grade (TU)</th>
                      <th className="border border-slate-400 p-1 text-center">Grade (PR)</th>
                      <th className="border border-slate-400 p-1 text-center">Net Grade</th>
                      <th className="border border-slate-400 p-1 text-center">Grade Point</th>
                      <th className="border border-slate-400 p-1 text-center">Credit Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paperList.map((p) => (
                      <tr key={p.sr} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-1 text-center">{p.sr}</td>
                        <td className="border border-slate-300 p-1 text-center font-mono">{p.code}</td>
                        <td className="border border-slate-300 p-1 text-center">*</td>
                        <td className="border border-slate-300 p-1 text-left uppercase font-medium">{p.name}</td>
                        <td className="border border-slate-300 p-1 text-center font-semibold">{p.type}</td>
                        <td className="border border-slate-300 p-1 text-center">{p.sem}</td>
                        <td className="border border-slate-300 p-1 text-center font-semibold">{p.credit}</td>
                        <td className="border border-slate-300 p-1 text-center">{p.th || '\u00A0'}</td>
                        <td className="border border-slate-300 p-1 text-center">{p.tu || '\u00A0'}</td>
                        <td className="border border-slate-300 p-1 text-center">{p.pr || '\u00A0'}</td>
                        <td className="border border-slate-300 p-1 text-center font-bold">{p.net}</td>
                        <td className="border border-slate-300 p-1 text-center font-bold">{p.point}</td>
                        <td className="border border-slate-300 p-1 text-center font-bold">{p.creditPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5. SGPA / CGPA Summary Grid */}
              <div className="w-full overflow-x-auto my-2 border border-slate-400 rounded-lg">
                <table className="w-full border-collapse text-xs text-center min-w-[500px]" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr className="bg-slate-200 font-bold">
                      <th className="border border-slate-400 p-1.5">Sem</th>
                      <th className="border border-slate-400 p-1.5">Total Credit</th>
                      <th className="border border-slate-400 p-1.5">Total Credit Point</th>
                      <th className="border border-slate-400 p-1.5">SGPA</th>
                      <th className="border border-slate-400 p-1.5">Result</th>
                      <th className="border border-slate-400 p-1.5">CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedSgpaTable.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 p-1.5">{row.sem}</td>
                        <td className="border border-slate-300 p-1.5">{row.credit}</td>
                        <td className="border border-slate-300 p-1.5">{row.point}</td>
                        <td className="border border-slate-300 p-1.5 font-bold">{row.sgpa}</td>
                        <td className="border border-slate-300 p-1.5 font-bold text-emerald-700">{row.result || '\u00A0'}</td>
                        <td className="border border-slate-300 p-1.5 font-bold">{row.cgpa || '\u00A0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 6. Abbreviations & Notes */}
              <div className="text-[11px] text-slate-800 space-y-1 pt-2 leading-snug">
                <p>
                  <strong>Abbreviations:</strong> RL: Result will be declared later, if necessary; ER: Essential Repeat; TH: Theory; PR: Practical; PW: Project Work; IA: Internal Assessment; P: Passed in Paper; F: Failed in Paper; *: Old Awards; NA: Not Available; RA: Award not received till the time of declaration of result or Absent;
                </p>
                <p className="mt-1">
                  <strong>Note:</strong> [1] This is web-based Statement of Marks/Grades and valid for all official purpose.<br/>
                  [2] <strong>Student has to pass the ER to become eligible for degree as per examination cycle and span period.</strong><br/>
                  [3] <strong>The information provided in this marksheet will be used for the printing of degree, so students are advised to ensure that all the information provided in the marksheet are correct. Corrections If any, contact the head/principal of the department/college.</strong>
                </p>
              </div>

              {/* 7. Controller Signature & Stamp */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800" style={{ fontSize: '12px' }}>
                    Date of Result Declaration: 20/04/2026
                  </span>

                  <div className="text-center font-bold text-slate-900 text-[11px] min-w-[200px]">
                    <img 
                      src="/Prof_Gurpreet_Tuteja.png" 
                      alt="Prof Gurpreet Singh Tuteja Signature" 
                      className="h-12 w-auto object-contain mx-auto mb-1"
                    />
                    (Prof. Gurpreet Singh Tuteja)<br/>
                    Controller of Examination
                  </div>
                </div>

                {/* Cut Line */}
                <div className="text-center py-2">
                  <span className="text-xs font-mono text-slate-400">------------------ ✂ Cut Here ✂ ------------------</span>
                </div>

                {/* Disclaimer */}
                <div className="text-[10px] text-slate-700 space-y-1">
                  <p>
                    <strong>Disclaimer:</strong> [1] Incase of any discrepancy, student should immediately contact to the Head/Principal of respective college/department within one month after the declaration of the result.<br/>
                    [2] The result displayed on university website is subject to correction, if any discrepancy is noticed at any point of time.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* 8. Bottom Action Buttons */}
          <div className="no-print flex items-center justify-center space-x-4 pt-4 pb-8">
            <button 
              onClick={handlePrint} 
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>PRINT MARKSHEET</span>
            </button>

            <button 
              onClick={() => setShowMarksheet(false)} 
              className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-slate-300 active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>CLOSE</span>
            </button>
          </div>
        </>
      ) : (
        /* Mode B: DU Official Result Portal Form (Full Width & Clean Large Screen Scaling) */
        <div className="w-full max-w-5xl mx-auto space-y-6 px-2 sm:px-4">
          
          {/* Main Form Body */}
          <div className="bg-white border border-slate-300 p-6 md:p-10 space-y-6 rounded-2xl shadow-xl text-sm font-sans">
            
            {/* Title Block */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <h2 className="text-2xl md:text-3xl font-extrabold text-red-900 font-serif tracking-tight">Semester Examination (Nov-Dec 2026)</h2>
              <h3 className="text-base md:text-lg font-bold text-red-800">Statement of Marks/Score Card</h3>
              <p className="text-xs md:text-sm font-bold text-pink-700 pt-1">
                Students are advised to save their Statement of Marks/Score Card for future purpose.<br/>
                This link will not be available later.
              </p>
              <p className="text-xs md:text-sm font-bold text-emerald-800 pt-1">
                Absent (AB), Or Result Awaited (RA) [Please contact the Principal of your respective college.]
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto space-y-5 pt-2 text-xs sm:text-sm">
              
              {/* College Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Please Select College Name <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5">
                  <select 
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                  >
                    <option value="School of Open Learning">School of Open Learning</option>
                  </select>
                </div>
              </div>

              {/* Exam Session */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Exam Session <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5">
                  <select 
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                  >
                    <option value="Nov-Dec 2026">Nov-Dec 2026</option>
                    <option value="May-June 2026">May-June 2026</option>
                  </select>
                </div>
              </div>

              {/* Exam Roll No */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Please Fill Exam Roll No. <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5">
                  <input 
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs md:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth (Exact DU Portal Dropdowns) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Date of Birth <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5 flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-700">DD</span>
                  <select 
                    value={dobDay} 
                    onChange={(e) => setDobDay(e.target.value)} 
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">DD</option>
                    {Array.from({ length: 31 }, (_, i) => {
                      const num = i + 1;
                      const val = String(num).padStart(2, '0');
                      return (
                        <option key={val} value={val}>
                          {num}
                        </option>
                      );
                    })}
                  </select>

                  <span className="text-xs font-bold text-slate-700">MM</span>
                  <select 
                    value={dobMonth} 
                    onChange={(e) => setDobMonth(e.target.value)} 
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const num = i + 1;
                      const val = String(num).padStart(2, '0');
                      return (
                        <option key={val} value={val}>
                          {num}
                        </option>
                      );
                    })}
                  </select>

                  <span className="text-xs font-bold text-slate-700">YYYY</span>
                  <select 
                    value={dobYear} 
                    onChange={(e) => setDobYear(e.target.value)} 
                    className="bg-white border border-slate-300 rounded-lg p-2 text-xs md:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 35 }, (_, i) => {
                      const yr = String(1990 + i);
                      return <option key={yr} value={yr}>{yr}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Image Captcha Code */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Image Captcha Code <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5 flex items-center space-x-3">
                  <div className="border border-emerald-400 bg-emerald-50 px-5 py-2 text-emerald-900 font-mono font-black text-lg italic rounded-xl border-dashed shadow-inner">
                    {captchaCode}
                  </div>
                  <button type="button" onClick={refreshCaptcha} className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs px-3.5 py-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer">
                    Refresh Code
                  </button>
                </div>
              </div>

              {/* Type Captcha */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <label className="sm:w-2/5 font-bold text-slate-800 sm:text-right text-xs md:text-sm">
                  Please Type Captcha Code <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="sm:w-3/5">
                  <input 
                    type="text"
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCaptchaInput(val);
                      if (captchaError) setCaptchaError('');
                    }}
                    placeholder="Enter 6-digit captcha code"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs md:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                    required
                  />
                  {captchaError && (
                    <p className="text-red-600 text-xs font-bold mt-1.5">{captchaError}</p>
                  )}
                </div>
              </div>

              {/* Print Score Card Button */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  className="bg-[#1b626e] hover:bg-[#154e58] text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Print Score Card
                </button>
              </div>

            </form>

            {/* Instructions */}
            <div className="border-t border-slate-200 pt-5 text-xs text-slate-800 space-y-1.5">
              <p className="font-bold text-red-900 text-center uppercase tracking-wider">
                [INSTRUCTIONS]
              </p>
              <p className="text-center text-emerald-900 font-bold max-w-3xl mx-auto leading-relaxed">
                The Students whose result is fall under the category of RA(result awaited)/AB(Absent), may contact to the Principal of the concerned College/Department/Centers within 10 days of declaration of the result.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
