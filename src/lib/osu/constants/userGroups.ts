export type UserGroupConfig = {
  name: string;
  id: number;
  color: number;
  emoteName: string;
};

export const USER_GROUPS: UserGroupConfig[] = [
  { name: 'GMT', id: 4, color: 0xffb969, emoteName: 'userGroupGMT' },
  { name: 'NAT', id: 7, color: 0xffb969, emoteName: 'userGroupNAT' },
  { name: 'DEV', id: 11, color: 0xffb969, emoteName: 'userGroupDEV' },
  { name: 'ALM', id: 16, color: 0xffb969, emoteName: 'userGroupALM' },
  { name: 'SPT', id: 22, color: 0xebd047, emoteName: 'userGroupSPT' },
  { name: 'BN', id: 28, color: 0xffb969, emoteName: 'userGroupBN' },
  { name: 'BOT', id: 29, color: 0xffb969, emoteName: 'userGroupBOT' },
  { name: 'LVD', id: 31, color: 0xffb969, emoteName: 'userGroupLVD' },
  { name: 'BNP', id: 32, color: 0xffb969, emoteName: 'userGroupBNP' },
  { name: 'PPY', id: 33, color: 0xffb969, emoteName: 'userGroupPPY' },
  { name: 'FA', id: 35, color: 0xffb969, emoteName: 'userGroupFA' },
  { name: 'BSC', id: 48, color: 0xffb969, emoteName: 'userGroupBSC' },
  { name: 'TC', id: 50, color: 0xffb969, emoteName: 'userGroupTC' },
];
