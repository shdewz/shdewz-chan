import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guild_id: { type: String, required: true, unique: true },
    prefix: String
});

const model = mongoose.models.guilds || mongoose.model('guilds', guildSchema);
export default model;
