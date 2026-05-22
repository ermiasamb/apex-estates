import { apiClient } from '@/lib/api-client';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
}

function mapApiUser(user: any): Agent {
  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Agent',
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '/images/avatar-placeholder.png',
  };
}

export async function fetchAgents(): Promise<Agent[]> {
  try {
    const response = await apiClient.get<any>('/users');
    if (response && response.items) {
      return response.items.map(mapApiUser);
    }
    if (Array.isArray(response)) {
      return response.map(mapApiUser);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
}

export async function fetchAgentById(id: string): Promise<Agent | null> {
  try {
    const response = await apiClient.get<any>(`/users/${id}`);
    if (response) {
      return mapApiUser(response);
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch agent by id ${id}:`, error);
    return null;
  }
}
