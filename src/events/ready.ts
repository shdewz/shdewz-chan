import { Client, ActivityType } from 'discord.js';

const attributes = {
    name: 'ready',
    once: true
}

export const execute = (client: Client) => {
    if (client.user) {
        client.user.setPresence({
            activities: [
                { type: ActivityType.Watching, name: 'you' },
            ],
            status: 'online'
        });

        console.log(`Logged in as ${client.user.username}`);
    }
};

export const { name, once } = attributes;