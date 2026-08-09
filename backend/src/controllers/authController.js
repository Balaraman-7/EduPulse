import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'edupulse_jwt_secret_key_viva_2026_super_secure', {
    expiresIn: '30d'
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    let studentProfile = null;
    if (user.role === 'STUDENT') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      studentProfileId: studentProfile ? studentProfile._id : null,
      token: generateToken(user._id)
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  let studentProfile = null;
  if (user.role === 'STUDENT') {
    studentProfile = await Student.findOne({ userId: user._id }).populate('facultyId', 'name email department');
  }

  return res.json({
    user,
    studentProfile
  });
};
