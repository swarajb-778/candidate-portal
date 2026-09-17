import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useApplications = (filters = {}) =>
  useQuery({
    queryKey: qk.applications(filters),
    queryFn: async () =>
      (await api.get('/applications', {
        params: { status: filters.status ?? 'all', sort: filters.sort ?? 'recent' }
      })).data
  });

export const useApplication = (slug) =>
  useQuery({
    queryKey: qk.application(slug),
    queryFn: async () => (await api.get(`/applications/${slug}`)).data,
    enabled: Boolean(slug)
  });
