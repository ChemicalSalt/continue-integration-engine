// backend/models/repo.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const repoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  repoUrl: { type: String, required: true },
  repoName: { type: String, required: true },
  branch: { type: String, default: 'main' },
  builds: [{ type: Schema.Types.ObjectId, ref: 'build' }]
}, { timestamps: true });

module.exports = mongoose.model('repo', repoSchema);
