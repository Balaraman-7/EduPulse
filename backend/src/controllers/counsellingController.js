import CounsellingSession from '../models/CounsellingSession.js';
import Student from '../models/Student.js';

export const addCounsellingSession = async (req, res) => {
  try {
    const { studentId, sessionDate, notes, actionItems, followUpDate, status } = req.body;
    const counsellorId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const session = new CounsellingSession({
      studentId,
      counsellorId,
      sessionDate: sessionDate || new Date(),
      notes,
      actionItems: actionItems || [],
      followUpDate: followUpDate || null,
      status: status || 'Under Review'
    });

    await session.save();

    // Increment counselling count
    student.previousCounsellingCount = (student.previousCounsellingCount || 0) + 1;
    await student.save();

    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const sessions = await CounsellingSession.find({ studentId })
      .populate('counsellorId', 'name email department')
      .sort({ sessionDate: -1 });

    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, actionItems, followUpDate } = req.body;

    const session = await CounsellingSession.findById(id);
    if (!session) return res.status(404).json({ message: 'Counselling session not found' });

    if (status) session.status = status;
    if (notes) session.notes = notes;
    if (actionItems) session.actionItems = actionItems;
    if (followUpDate) session.followUpDate = followUpDate;

    await session.save();

    return res.json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
