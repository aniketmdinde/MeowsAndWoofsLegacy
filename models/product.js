const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true,
        min : 0
    },
    AnimalCategory : {
        type : String,
        lowercase : true,
        enum: ['dog','cat'],

    },
    ProductCategory : {
        type : String,
        lowercase : true,
        enum: ['food','leash', 'toys']
    },
    image : {
        type: String,
        required: true
    }
})

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product