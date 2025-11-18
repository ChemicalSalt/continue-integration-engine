// backend/models/build.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buildSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'repo', required: true },
  repoName: { type: String, required: true },
  branch: { type: String, default: 'main' },
  commitSHA: { type: String },
  status: { type: String, enum: ['pending','running','success','fail'], default: 'pending' },
  logs: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('build', buildSchema);
