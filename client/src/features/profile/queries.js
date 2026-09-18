import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useProfile = () =>
  useQuery({ queryKey: qk.profile, queryFn: async () => (await api.get('/me/profile')).data });

export const useRecruiterView = (enabled) =>
  useQuery({
    queryKey: qk.recruiterView,
    queryFn: async () => (await api.get('/me/profile/recruiter-view')).data,
    enabled
  });

// Any profile write must invalidate `me` alongside `profile`, or the chrome's
// name and initials go stale while the profile page updates.
export const useProfileMutation = (fn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      if (data) qc.setQueryData(qk.profile, data);
      qc.invalidateQueries({ queryKey: qk.profile });
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.recruiterView });
    }
  });
};

export const patchSection = (body) => api.patch('/me/profile', body).then((r) => r.data);
export const patchEeo = (body) => api.patch('/me/profile/eeo', body).then((r) => r.data);
export const putSkills = (skills) => api.put('/me/profile/skills', { skills }).then((r) => r.data);
export const patchVisibility = (openToOtherRoles) =>
  api.patch('/me/visibility', { openToOtherRoles }).then((r) => r.data);

export const addRow = (field, body) => api.post(`/me/profile/${field}`, body).then((r) => r.data);
export const editRow = (field, id, body) => api.patch(`/me/profile/${field}/${id}`, body).then((r) => r.data);
export const removeRow = (field, id) => api.delete(`/me/profile/${field}/${id}`).then((r) => r.data);
