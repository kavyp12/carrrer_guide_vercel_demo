// api/models/QuestionnaireModel.js
const mongoose = require('mongoose');

const QuestionnaireSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  age: {
    type: String,
    default: ''
  },
  academicInfo: {
    type: String,
    default: ''
  },
  interests: {
    type: String,
    default: ''
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema);