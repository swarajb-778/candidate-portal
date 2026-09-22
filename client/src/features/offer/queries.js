import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useOffer = (slug) =>
  useQuery({
    queryKey: qk.offer(slug),
    queryFn: async () => (await api.get(`/offers/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false
  });

// Resolving an offer moves the offer, the application, the list and the feed.
export const useOfferMutation = (slug, mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (data) qc.setQueryData(qk.offer(slug), data);
      qc.invalidateQueries({ queryKey: qk.offer(slug) });
      qc.invalidateQueries({ queryKey: qk.application(slug) });
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const proposeStartDate = (slug, date) =>
  api.patch(`/offers/${slug}/start-date`, { proposedByCandidate: date }).then((r) => r.data);

export const acceptOffer = (slug, body) => api.post(`/offers/${slug}/accept`, body).then((r) => r.data);
export const declineOffer = (slug, reason) => api.post(`/offers/${slug}/decline`, { reason }).then((r) => r.data);

export const letterUrl = (slug) => `/api/v1/offers/${slug}/letter`;
