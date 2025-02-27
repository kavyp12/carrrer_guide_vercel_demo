// api/models/Marks.js
const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: [{
    subjectName: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Marks', MarksSchema);