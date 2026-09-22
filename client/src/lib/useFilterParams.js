import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../store/slices/filters.js';

// The URL is the source of truth on read, so a filtered list is genuinely
// shareable and survives a reload. Redux carries the choice when you navigate
// away and back, where there is no URL to read from.
export const useFilterParams = (scope, keys) => {
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.filters[scope]);
  const [params, setParams] = useSearchParams();

  const value = {};
  for (const key of keys) value[key] = params.get(key) ?? stored[key];

  // A URL arrived at directly (a shared link, a reload) has to push its values
  // into Redux, or navigating away and back would silently revert them.
  const serialised = keys.map((k) => `${k}=${params.get(k) ?? ''}`).join('&');
  useEffect(() => {
    const patch = {};
    for (const key of keys) {
      const fromUrl = params.get(key);
      if (fromUrl && fromUrl !== stored[key]) patch[key] = fromUrl;
    }
    if (Object.keys(patch).length) dispatch(setFilter({ scope, patch }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialised]);

  const update = (patch) => {
    dispatch(setFilter({ scope, patch }));
    setParams({ ...value, ...patch }, { replace: true });
  };

  return [value, update];
};
