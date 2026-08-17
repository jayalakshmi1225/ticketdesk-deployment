import api from './index';
import type { DashboardSummaryDto } from '../types';

export const getDashboardSummaryApi = async (): Promise<DashboardSummaryDto> => {
  const response = await api.get<DashboardSummaryDto>('/dashboard/summary');
  return response.data;
};
