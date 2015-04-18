// app/models/nootti.js
// grab the mongoose module
var mongoose = require('mongoose');

var NoottiSchema = new mongoose.Schema({
  title: String,
  content: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Nootti', NoottiSchema);
