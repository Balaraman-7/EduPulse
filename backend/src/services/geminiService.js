import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const generateGeminiRecommendations = async (student, prediction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const systemPrompt = `You are EduPulse AI, an empathetic academic counselling support system for higher education institutions.
IMPORTANT SAFETY & ETHICAL RULES:
1. DO NOT diagnose medical, psychological, or psychiatric conditions.
2. DO NOT state predictions with certainty (e.g. NEVER say "This student will drop out"). Use "Model-estimated indicators suggest...".
3. DO NOT invent facts or non-existent metrics. Use only supplied student data.
4. Always recommend contacting an appropriate human faculty member or counsellor for official support.
5. Keep recommendations realistic, actionable, structured, and encouraging.

STUDENT PROFILE DATA:
Name: ${student.name}
Department: ${student.department}
Semester: ${student.semester}
Attendance: ${student.attendancePercentage}%
CGPA: ${student.cgpa}
Backlogs: ${student.backlogCount}
Internal Examination Marks: ${student.internalMarks}%
Assignment Score: ${student.assignmentScore}%
Model-Estimated Risk Level: ${prediction.riskLevel} (${prediction.riskScore}%)
Major Risk Factors: ${prediction.topFactors.map(f => f.friendlyName || f.feature).join(', ')}

Respond ONLY with valid JSON matching this exact structure:
{
  "riskExplanation": "A 2-3 sentence empathetic non-alarmist explanation of why current indicators require attention.",
  "facultySuggestions": [
    "3-4 practical action items for faculty/counsellor to support this student"
  ],
  "studentStudyPlan": [
    "3-4 concrete weekly study strategies tailored to their weak areas"
  ],
  "shortTermPlan": [
    "3 specific high-priority steps for the next 7 to 14 days"
  ],
  "encouragingMessage": "A warm, supportive, motivating closing note for the student."
}`;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 }
      }, { timeout: 8000 });

      const textOutput = response.data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textOutput);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini API] Direct Gemini call failed: ${err.message}. Using structured local advice fallback.`);
    }
  }

  // Realistic fallback recommendation generator if API key is not configured or fails
  const att = student.attendancePercentage;
  const backlogs = student.backlogCount;
  const cgpa = student.cgpa;

  return {
    riskExplanation: `Current academic indicators suggest that ${student.name} would benefit from proactive academic support. Attendance (${att}%) and CGPA (${cgpa}) reflect areas where targeted faculty mentoring can help regain momentum.`,
    facultySuggestions: [
      `Schedule a 1-on-1 academic check-in session with ${student.name} to discuss attendance constraints.`,
      `Provide supplementary practice problems for core subjects with active backlogs (${backlogs}).`,
      `Assign a peer tutor from senior semester to support internal assignment preparation.`,
      `Review weekly attendance records and set a baseline milestone of 80% for the next month.`
    ],
    studentStudyPlan: [
      `Allocate 90 minutes daily to active review of core subjects with pending backlogs.`,
      `Form or join a study group for assignment reviews to boost internal score consistency.`,
      `Maintain a weekly attendance log and attend all scheduled lab/tutorial sessions without fail.`
    ],
    shortTermPlan: [
      `Week 1: Meet assigned faculty counsellor to establish an academic recovery agreement.`,
      `Week 2: Clear all outstanding assignment backlog submissions and revise past question papers.`,
      `Week 3: Attend weekend review workshops for difficult module topics.`
    ],
    encouragingMessage: `Academic challenges are temporary setbacks that can be overcome with consistent daily effort and early guidance. You have strong potential to improve your results!`
  };
};

export const generateGeminiChatResponse = async (student, userMessage, chatHistory = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstruction = `You are EduPulse AI, an empathetic academic counselling chatbot for students.
Your student context:
Name: ${student ? student.name : 'Student'}
Department: ${student ? student.department : 'Engineering'}
Semester: ${student ? student.semester : 4}
Attendance: ${student ? student.attendancePercentage : 75}%
CGPA: ${student ? student.cgpa : 7.2}
Backlogs: ${student ? student.backlogCount : 0}

Rules:
- Provide supportive, clear, actionable advice regarding study techniques, time management, attendance improvement, and exam preparation.
- Do NOT act as a doctor, therapist, or official university administrator.
- Always remind the student nicely that human faculty counsellors are available for official university guidance.
- Keep answers encouraging, concise, and easy to read.`;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent Question: ${userMessage}` }] }
        ]
      }, { timeout: 8000 });

      return response.data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.warn(`[Gemini Chat] API request failed: ${err.message}. Using intelligent conversational fallback.`);
    }
  }

  // Conversational response engine fallback
  const msgLower = userMessage.toLowerCase();
  if (msgLower.includes('attendance') || msgLower.includes('absent')) {
    return `Hi ${student?.name || 'there'}! To boost your attendance from ${student?.attendancePercentage || 75}%:
1. **Track Daily Classes**: Set a daily morning reminder for mandatory lectures.
2. **Prioritize High-Credit Courses**: Ensure 100% attendance in lectures with heavy internal credit weight.
3. **Submit Leave Intimations**: If absent due to health, submit medical documentation to your department head promptly so approved leaves are recorded.
*Remember: Your faculty advisor is available to help resolve any scheduling conflicts!*`;
  } else if (msgLower.includes('backlog') || msgLower.includes('clear')) {
    return `Clearing backlogs requires a steady, structured approach:
1. **Focus on Core Concepts**: Obtain previous 3 years of semester question papers.
2. **Dedicated Daily Slot**: Reserve 1 hour every evening specifically for backlog revision.
3. **Faculty Office Hours**: Visit your course instructor during office hours to solve difficult numericals or concepts.
*You've got this! Step-by-step progress makes a huge difference.*`;
  } else if (msgLower.includes('study plan') || msgLower.includes('schedule') || msgLower.includes('cgpa')) {
    return `Here is a recommended 4-Step Academic Booster Strategy:
- **Phase 1 (Morning)**: 45-minute focused reading of lecture notes before classes.
- **Phase 2 (Afternoon)**: Active participation in lab practicals and tutorial problems.
- **Phase 3 (Evening)**: Solve assignment questions and revise backlogs for 90 minutes.
- **Phase 4 (Weekly Review)**: Test your knowledge every Sunday with mock quizzes.
*Feel free to adjust this schedule with your faculty counsellor during your next review!*`;
  }

  return `Thank you for reaching out, ${student?.name || 'Student'}! 
Based on your current academic profile (Attendance: ${student?.attendancePercentage || 75}%, CGPA: ${student?.cgpa || 7.0}), focusing on consistent attendance and timely assignment submissions will yield immediate improvements. 

Is there a specific area like time management, exam prep, or backlog revision you'd like to focus on today?`;
};
