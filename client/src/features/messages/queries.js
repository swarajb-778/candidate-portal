import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useThread = (slug) =>
  useQuery({
    queryKey: qk.messages(slug),
    queryFn: async () => (await api.get(`/threads/${slug}/messages`)).data,
    enabled: Boolean(slug)
  });

// The composer should feel instant, so this one is optimistic: the bubble is
// painted before the round trip and rolled back if the send fails.
export const useSendMessage = (slug) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body) => api.post(`/threads/${slug}/messages`, { body }).then((r) => r.data),

    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: qk.messages(slug) });
      const previous = qc.getQueryData(qk.messages(slug));

      qc.setQueryData(qk.messages(slug), (old) =>
        old
          ? {
              ...old,
              items: [
                ...old.items,
                { _id: `pending-${Date.now()}`, fromCandidate: true, body, sentAt: new Date().toISOString(), pending: true }
              ]
            }
          : old
      );

      return { previous };
    },

    onError: (_err, _body, ctx) => qc.setQueryData(qk.messages(slug), ctx?.previous),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.messages(slug) });
      qc.invalidateQueries({ queryKey: qk.threads });
    }
  });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.post(`/threads/${slug}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.threads })
  });
};
