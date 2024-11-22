import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
    channel_id: { type: String, required: true, unique: true },
    last_beatmap: String
});

const model = mongoose.models.channels || mongoose.model('channels', channelSchema);
export default model;