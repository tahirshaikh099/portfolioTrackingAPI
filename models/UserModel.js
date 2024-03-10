const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, require: true, trim: true, min: 3, max: 20, },
    password: { type: String, require: true, trim: true, min: 6, },
    apikey: String, },
    { timestamps: true });



userSchema.statics = {
    loadAll: function () { return this.find().exec(); },

    load: function (_id) { return this.findOne({ _id }).exec(); },
};

const User = mongoose.model('User', userSchema);

module.exports = { User };