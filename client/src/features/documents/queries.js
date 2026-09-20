import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export const useDocuments = (tab = 'mine') =>
  useQuery({
    queryKey: qk.documents(tab),
    queryFn: async () => (await api.get('/documents', { params: { tab } })).data
  });

// Uploading or deleting moves both tabs, the profile strength bar, and any
// application the file is attached to.
const useDocumentMutation = (mutationFn, extra = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    ...extra,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: qk.profile });
      qc.invalidateQueries({ queryKey: ['application'] });
      extra.onSuccess?.(...args);
    }
  });
};

// Progress is the real Axios figure — never a timer.
export const useUpload = ({ onProgress } = {}) =>
  useDocumentMutation(({ file, kind, applicationSlug, replaceSlug }) => {
    const form = new FormData();
    form.append('file', file);
    if (kind) form.append('kind', kind);
    if (applicationSlug) form.append('applicationSlug', applicationSlug);

    const config = {
      onUploadProgress: (e) =>
        onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
    };

    return replaceSlug
      ? api.put(`/documents/${replaceSlug}`, form, config).then((r) => r.data)
      : api.post('/documents', form, config).then((r) => r.data);
  });

export const useDeleteDocument = () =>
  useDocumentMutation((slug) => api.delete(`/documents/${slug}`));

export const downloadUrl = (slug) => `/api/v1/documents/${slug}/download`;
export const previewUrl = (slug) => `/api/v1/documents/${slug}/preview`;
