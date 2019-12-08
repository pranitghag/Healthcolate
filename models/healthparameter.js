var mongoose = require("mongoose");

var healthSchema = new mongoose.Schema({
    username: String,
    age: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    sleepPatterns: Number,
    cholesterol: Number,
    bloodSugar: Number,
    bloodPressure_systolic: Number,
    bloodPressure_diastolic: Number,
    timeStamp: Number,
    dateAndTime: String,
    prevHash: String,
    currentHash: String,
});

module.exports = mongoose.model("HealthParameter",healthSchema);
