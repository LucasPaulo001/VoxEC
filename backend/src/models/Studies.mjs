import mongoose, { Schema } from "mongoose"

const StudyTopicSchema = new Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const StudyTaskSchema = new Schema({
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyTopic',
        required: true
    },
    title: { 
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pendente', 'em andamento', 'concluído'],
        default: 'pendente'
    }
})

const StudyTopic = mongoose.model('StudyTopic', StudyTopicSchema)
const StudyTask = mongoose.model('StudyTask', StudyTaskSchema)

export default { StudyTopic, StudyTask }