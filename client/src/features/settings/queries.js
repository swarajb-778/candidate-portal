import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useSessions = () =>
  useQuery({ queryKey: qk.sessions, queryFn: async () => (await api.get('/me/sessions')).data });

// Settings live on the user document, so `me` is the cache that has to move.
export const useSettingsMutation = (fn, { invalidate = [qk.me] } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => invalidate.forEach((key) => qc.invalidateQueries({ queryKey: key }))
  });
};

export const patchSettings = (body) => api.patch('/me/settings', body).then((r) => r.data);
export const patchChannels = (body) => api.patch('/me/settings/notifications', body).then((r) => r.data);
export const changePassword = (body) => api.post('/me/password', body).then((r) => r.data);
export const patchTwoFactor = (enabled) => api.patch('/me/two-factor', { enabled }).then((r) => r.data);
export const revokeSession = (id) => api.delete(`/me/sessions/${id}`).then((r) => r.data);

export const requestExport = () => api.post('/me/export').then((r) => r.data);

export const useExportJob = (jobId) =>
  useQuery({
    queryKey: qk.exportJob(jobId),
    queryFn: async () => (await api.get(`/me/export/${jobId}`)).data,
    enabled: Boolean(jobId),
    refetchInterval: (q) => (q.state.data?.state === 'ready' ? false : 1500)
  });
