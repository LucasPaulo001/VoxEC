import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, requirder: true },
    birth: { type: Date, required: true },
    tokenVerificacao: { type: String },
    emailVerificado: { type: Boolean, default: false },
    tokenVerificado: { type: String },
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    avatar: {type: String, default: ""},
    friendRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
})

export default mongoose.model('User', UserSchema)