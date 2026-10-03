import { apiClient } from './apiClient';
import { mockMembers } from '@/mock';
import type { Member } from '@/types';

export const memberService = {
  getAll: async (): Promise<Member[]> => {
    try {
      const response = await apiClient.get<Member[]>('/members');
      return response.data;
    } catch {
      return mockMembers;
    }
  },

  getById: async (id: string): Promise<Member | undefined> => {
    try {
      const response = await apiClient.get<Member>(`/members/${id}`);
      return response.data;
    } catch {
      return mockMembers.find((m) => m.id === id);
    }
  },

  create: async (member: Omit<Member, 'id' | 'joinedDate'>): Promise<Member> => {
    try {
      const response = await apiClient.post<Member>('/members', member);
      return response.data;
    } catch {
      const newMember: Member = {
        ...member,
        id: `MEM-00${mockMembers.length + 1}`,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      return newMember;
    }
  },
};
