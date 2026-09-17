import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useInterviews = (tab = 'upcoming') =>
  useQuery({
    queryKey: qk.interviews(tab),
    queryFn: async () => (await api.get('/interviews', { params: { tab } })).data
  });

export const useInterview = (slug) =>
  useQuery({
    queryKey: qk.interview(slug),
    queryFn: async () => (await api.get(`/interviews/${slug}`)).data,
    enabled: Boolean(slug)
  });

export const useAvailabilityRequest = () =>
  useQuery({
    queryKey: qk.availabilityRequest,
    queryFn: async () => (await api.get('/availability/request')).data
  });

// Ticking a prep item is safe to do optimistically — the box should respond to
// the click, not to the round trip.
export const usePrepToggle = (slug) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, done }) => api.patch(`/interviews/${slug}/prep/${itemId}`, { done }),
    onMutate: async ({ itemId, done }) => {
      await qc.cancelQueries({ queryKey: qk.interview(slug) });
      const previous = qc.getQueryData(qk.interview(slug));

      qc.setQueryData(qk.interview(slug), (old) =>
        old
          ? {
              ...old,
              prepChecklist: old.prepChecklist.map((i) => (i._id === itemId ? { ...i, done } : i))
            }
          : old
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(qk.interview(slug), ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.interview(slug) })
  });
};
