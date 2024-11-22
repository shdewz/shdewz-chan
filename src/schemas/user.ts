import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    prefs: {
        osu: {
            user_id: Number
        },
        location: {
            string: String,
            lat: Number,
            lon: Number
        }
    }
});

const model = mongoose.models.users || mongoose.model('users', userSchema);
export default model;