import axios from 'axios';

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
Major Risk Factors: ${prediction.topFactors ? prediction.topFactors.map(f => f.friendlyName || f.feature).join(', ') : 'Attendance, CGPA'}

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
      console.warn(`[Gemini API] Direct Gemini call failed (${err.message}). Using structured local advice fallback.`);
    }
  }

  // Realistic fallback recommendation generator if API key is not configured or fails
  const att = student.attendancePercentage;
  const backlogs = student.backlogCount;
  const cgpa = student.cgpa;

  return {
    riskExplanation: `Current academic indicators suggest that ${student.name} would benefit from proactive academic support. Attendance (${att}%) and CGPA (${cgpa}) reflect key areas where targeted faculty mentoring can help regain momentum.`,
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

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.warn(`[Gemini Chat] API request failed (${err.message}). Using intelligent conversational fallback.`);
    }
  }

  // --- Intelligent Local Conversational Fallback Engine ---
  const msgRaw = userMessage || '';
  const msgLower = msgRaw.toLowerCase().trim();

  // Normalize common typos (e.g. 'plain' -> 'plan', 'tody' -> 'today', 'atendance' -> 'attendance')
  const isPlanQuery = /plan|plain|today|tody|schedule|schdule|routine|daily|agenda|task|timetable/i.test(msgRaw);
  const isAttendanceQuery = /attendance|atendance|absent|bunk|percentage|shortage|classes|leave/i.test(msgRaw);
  const isBacklogQuery = /backlog|backlogg|clear|fail|arrear|reexam|re-exam|pending/i.test(msgRaw);
  const isExamQuery = /exam|exm|test|prep|study|cgpa|gpa|marks|score|internal|quiz|revision|notes/i.test(msgRaw);
  const isFacultyQuery = /faculty|teacher|counsellor|counselor|mentor|advisor|professor|office hour/i.test(msgRaw);
  const isStressQuery = /stress|anxious|worried|scared|hard|difficult|help|struggling|pressure|depressed|sad/i.test(msgRaw);
  const isGreetingQuery = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you)\b/i.test(msgRaw);

  const name = student?.name || 'Student';
  const att = student?.attendancePercentage || 75;
  const cgpa = student?.cgpa || 7.0;
  const backlogs = student?.backlogCount || 0;
  const dept = student?.department || 'Engineering';
  const sem = student?.semester || 4;

  if (isGreetingQuery) {
    return `Hello ${name}! 👋 I am **EduPulse AI**, your academic guidance assistant. 
\nCurrently viewing your profile:
- **Department**: ${dept} (Semester ${sem})
- **Attendance**: ${att}%
- **CGPA**: ${cgpa}
- **Active Backlogs**: ${backlogs}

How can I assist you today? You can ask me about creating a daily study plan, improving attendance, clearing backlogs, or exam prep strategies!`;
  }

  if (isPlanQuery) {
    return `Here is a personalized **Daily Action Plan** for **${name}** (Semester ${sem}):

1. 🌅 **Morning Focus (8:00 AM - 12:00 PM)**:
   - Attend all scheduled ${dept} lectures to maintain and improve your current attendance rate (${att}%).
   - Take active notes on key lecture topics.

2. ☀️ **Afternoon Session (2:00 PM - 5:00 PM)**:
   - Complete ongoing lab reports and internal assignment tasks promptly to secure full internal marks.
   - Review difficult concepts with classmates or peer tutors.

3. 🌙 **Evening Revision (7:00 PM - 9:00 PM)**:
   ${backlogs > 0 
     ? `- Reserve 60 minutes specifically for backlog topic revision (${backlogs} active backlog${backlogs > 1 ? 's' : ''}).\n   - Reserve 60 minutes for current semester core subjects.`
     : `- Spend 90 minutes revising current semester core topics to boost CGPA (${cgpa}).\n   - Practice 3-5 numerical problems or code exercises.`}

4. 📌 **Quick Advice**:
   - Check in with your faculty advisor this week for personalized guidance.`;
  }

  if (isAttendanceQuery) {
    const requiredAtt = 75;
    const isShort = att < requiredAtt;
    return `Hi ${name}! Here is your **Attendance Optimization Strategy**:

- **Current Attendance**: ${att}% ${isShort ? '⚠️ *(Below mandatory 75% target)*' : '✅ *(On track)*'}
- **Department**: ${dept} | Semester ${sem}

**Recommended Action Steps**:
1. 🗓️ **Zero-Absence Goal**: Attend all remaining classes and labs this month without missing sessions.
2. 📝 **Submit Medical/Official Leaves**: If you were absent due to legitimate reasons or health, ensure medical certificates are turned into the department head immediately.
3. 🤝 **Faculty Check-in**: Meet your class coordinator to review your exact attendance margin before upcoming internal exams.

*Tip: Maintaining >75% attendance unlocks full eligibility for semester end-exams.*`;
  }

  if (isBacklogQuery) {
    return `Clearing backlogs requires a structured approach. Here is your **Backlog Resolution Roadmap**:

- **Active Backlogs**: ${backlogs}
- **Current CGPA**: ${cgpa}

**Step-by-Step Strategy**:
1. 📚 **Gather Past Exam Papers**: Download previous 3 years' end-semester question papers for subject backlogs.
2. ⏱️ **Daily 60-Min Revision Block**: Dedicate 1 uninterrupted hour every evening exclusively to backlog preparation.
3. 👩‍🏫 **Faculty Office Hours**: Visit your course instructor during weekly office hours to clear doubts on high-weightage chapters.
4. 📝 **Mock Tests**: Practice solving 1 full paper under timed conditions every Sunday.

*You can definitely clear these! Consistent daily effort is key.*`;
  }

  if (isExamQuery) {
    return `Here is your **Academic & Exam Prep Strategy** (${name}, ${dept}):

1. 🎯 **Priority Subject Matrix**: Focus 60% of study time on subjects with heaviest credit weightage and lowest internal scores.
2. 🧠 **Active Recall & Spaced Repetition**: Instead of passive reading, test yourself using flashcards and past question papers.
3. 📊 **CGPA Target Booster**: Aim to score 85%+ in internal assignments and continuous assessment tests.
4. ⏰ **Pomodoro Method**: Work in 25-minute focused bursts followed by a 5-minute break to maintain concentration.

*Feel free to adjust this routine with your faculty mentor!*`;
  }

  if (isFacultyQuery) {
    return `Connecting with your faculty counsellor is a great decision, ${name}! 

**How to approach your faculty mentor**:
1. 📧 **Email or In-Person**: Drop by during their posted office hours or send a polite message requesting a 15-minute academic discussion.
2. 📋 **What to Prepare**: Bring your latest attendance record (${att}%), internal marks, and specific questions regarding your coursework.
3. 💬 **Discussion Points**: Ask for guidance on backlog revision priorities and strategies to boost your internal marks.

*Faculty counsellors are here to support your success!*`;
  }

  if (isStressQuery) {
    return `It is completely normal to feel overwhelmed at times, ${name}. Take a deep breath! 🌟

**Here are 3 reassuring steps to regain focus**:
1. 🎯 **Break Tasks Into Small Steps**: Don't try to study everything at once. Pick ONE subject or topic and work on it for 30 minutes.
2. 📈 **Focus on Progress, Not Perfection**: Small improvements in attendance (${att}%) and study consistency build up quickly over time.
3. 🗣️ **Reach Out for Support**: Talk to your faculty counsellor or a trusted mentor. You don't have to navigate academic challenges alone.

How can I help break down your study topics today?`;
  }

  // --- Dynamic Catch-All Response (Tailored to specific query text) ---
  const cleanedTopic = msgRaw.length > 50 ? msgRaw.substring(0, 50) + '...' : msgRaw;
  return `Thank you for your question regarding **"${cleanedTopic}"**, ${name}!

Based on your profile in **${dept} (Semester ${sem})**:
- **Attendance**: ${att}%
- **CGPA**: ${cgpa}
${backlogs > 0 ? `- **Active Backlogs**: ${backlogs}` : ''}

**Custom Guidance for your query**:
1. 💡 **Focus Area**: Align your daily study routine around high-priority subjects and mandatory lecture attendance.
2. 📖 **Action Item**: Set aside 45-60 minutes today to review your recent notes or complete upcoming assignment submissions.
3. 👩‍🏫 **Mentorship**: Discuss your specific goal ("${cleanedTopic}") with your faculty advisor for official department guidance.

Is there a specific topic, schedule, or study technique you would like more detail on?`;
};
