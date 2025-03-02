import mongoose, { Schema } from 'mongoose'

const GroupSchema = new Schema({
    groupName: {type: String, required: true},
    groupDescription: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

export default mongoose.model('Group', GroupSchema)