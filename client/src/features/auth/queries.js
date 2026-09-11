import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

// The app's session probe. Everything in the chrome — greeting, header name,
// both avatars — reads from here, never from a constant.
export const useMe = () =>
  useQuery({
    queryKey: qk.me,
    queryFn: async () => (await api.get('/auth/me')).data.user,
    retry: false,
    staleTime: 5 * 60_000
  });

// Every date in the product is formatted in the signed-in user's zone.
export const useZone = () => {
  const { data: me } = useMe();
  return me?.settings?.timezone ?? 'America/Los_Angeles';
};

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values) => (await api.post('/auth/login', values)).data.user,
    onSuccess: (user) => qc.setQueryData(qk.me, user)
  });
};

export const useSignup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values) => (await api.post('/auth/signup', values)).data.user,
    onSuccess: (user) => qc.setQueryData(qk.me, user)
  });
};

export const useSso = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider) => (await api.post(`/auth/sso/${provider}`)).data.user,
    onSuccess: (user) => qc.setQueryData(qk.me, user)
  });
};

export const useForgotPassword = () =>
  useMutation({ mutationFn: (values) => api.post('/auth/forgot-password', values) });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => qc.clear()
  });
};

// Badge counts for the sidebar and tab bar. Same keys the Notification Center
// and Messages screens use — one query, several consumers.
export const useNotifications = (filter = 'all') =>
  useQuery({
    queryKey: qk.notifications(filter),
    queryFn: async () => (await api.get('/notifications', { params: { filter } })).data
  });

export const useThreads = () =>
  useQuery({
    queryKey: qk.threads,
    queryFn: async () => (await api.get('/threads')).data
  });
