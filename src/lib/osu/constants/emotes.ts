export type EmoteConfig = {
  name: string;
  color: number;
  emote: string;
};

export const EMOTES: EmoteConfig[] = [
  { name: 'SSH', color: 0xcb1699, emote: '<:rankingSSH:871388940836413471>' },
  { name: 'SS', color: 0xcb1699, emote: '<:rankingSS:871388941205508126>' },
  { name: 'SH', color: 0x01a9b7, emote: '<:rankingSH:871388941281021963>' },
  { name: 'S', color: 0x01a9b7, emote: '<:rankingS:871388941058732084>' },
  { name: 'A', color: 0x84d71c, emote: '<:rankingA:871388941088096316>' },
  { name: 'B', color: 0xe2b130, emote: '<:rankingB:871388941130014740>' },
  { name: 'C', color: 0xfb8a5a, emote: '<:rankingC:871388941188747265>' },
  { name: 'D', color: 0xf45755, emote: '<:rankingD:871388941151002665>' },
  { name: 'F', color: 0xe1e1e1, emote: '<:rankingF:871388941222297620>' },

  { name: 'miss', color: 0xf52424, emote: '<:miss:891674271800262706>' },
  { name: 'hit300', color: 0x26abf8, emote: '<:hit300:891673481115238492>' },
  { name: 'hit100', color: 0x23ec57, emote: '<:hit100:891673481568194610>' },
  { name: 'hit50', color: 0xedc936, emote: '<:hit50:891673481538846730>' },

  {
    name: 'increase',
    color: 0x55ee5c,
    emote: '<:increase:949320646318510121>',
  },
  {
    name: 'decrease',
    color: 0xf94c4c,
    emote: '<:decrease:949320646301745252>',
  },

  { name: 'twitter', color: 0xdcddde, emote: '<:twitter:949331827775135784>' },
  { name: 'discord', color: 0xdcddde, emote: '<:discord:949331827460550757>' },
];
