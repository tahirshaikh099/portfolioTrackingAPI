const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
    stock: { type: Schema.Types.ObjectId, ref: 'Stock' },
    type: String,
    rate: Number,
    quantity: Number
}, {
    timestamps: true
});

transactionSchema.statics = {
    loadAll: function () {
        return this.find().populate('stock', '_id name price').exec();
    },
};


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction };