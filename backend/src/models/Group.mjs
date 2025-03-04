import mongoose, { Schema } from 'mongoose'

const GroupSchema = new Schema({
    groupName: {type: String, required: true},
    groupDescription: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    admin: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}, {timestamps: true})

export default mongoose.model('Group', GroupSchema)