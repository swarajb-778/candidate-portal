import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

// One query key, two consumers: the Notification Center and the header bell.
export const useNotifications = (filter = 'all') =>
  useQuery({
    queryKey: qk.notifications(filter),
    queryFn: async () => (await api.get('/notifications', { params: { filter } })).data
  });

const useNotificationMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  });
};

export const useMarkRead    = () => useNotificationMutation((slug) => api.post(`/notifications/${slug}/read`));
export const useMarkAllRead = () => useNotificationMutation(() => api.post('/notifications/read-all'));
export const useDismiss     = () => useNotificationMutation((slug) => api.delete(`/notifications/${slug}`));
