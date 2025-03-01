import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, requirder: true },
    birth: { type: Date, required: true },
    tokenVerificacao: { type: String },
    emailVerificado: { type: Boolean, default: false },
    tokenVerificado: { type: String },
})

export default mongoose.model('User', UserSchema)