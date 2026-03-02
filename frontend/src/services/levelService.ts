import api from './api';

export interface Level {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const levelService = {
  async getAllLevels(): Promise<Level[]> {
    const response = await api.get('/levels');
    return response.data;
  },

  async createLevel(data: { name: string; description?: string }): Promise<Level> {
    const response = await api.post('/admin/levels', data);
    return response.data;
  },

  async updateLevel(levelId: string, data: Partial<Level>): Promise<Level> {
    const response = await api.put(`/admin/levels/${levelId}`, data);
    return response.data;
  },

  async deleteLevel(levelId: string): Promise<void> {
    await api.delete(`/admin/levels/${levelId}`);
  },
};
