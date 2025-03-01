import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, requirder: true},
    birth: {type: Date, required: true}
})

export default mongoose.model('User', UserSchema)