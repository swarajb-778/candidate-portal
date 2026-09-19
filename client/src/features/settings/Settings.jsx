import { useSearchParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { SkeletonCard, Tab, TabList, TabPanel, Tabs } from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { setFilter } from '../../store/slices/filters.js';
import { useMe, useZone } from '../auth/queries.js';
import { AccountTab } from './AccountTab.jsx';
import { NotificationsTab } from './NotificationsTab.jsx';
import { PrivacyTab } from './PrivacyTab.jsx';

const TABS = [
  { value: 'account', label: 'Account' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'privacy', label: 'Privacy & data' }
];

export const Settings = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  const { data: me, isPending } = useMe();
  const [params, setParams] = useSearchParams();

  const stored = useSelector((s) => s.filters.settings.tab);
  const tab = params.get('tab') ?? stored;

  const change = (value) => {
    dispatch(setFilter({ scope: 'settings', patch: { tab: value } }));
    setParams({ tab: value }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-page-wide">
      <PageHeader
        title="Settings"
        sub="Account access, how we contact you, and what happens to your data."
      />

      <Tabs value={tab} onValueChange={change}>
        <TabList>
          {TABS.map((t) => <Tab key={t.value} value={t.value}>{t.label}</Tab>)}
        </TabList>

        {isPending ? (
          <SkeletonCard lines={6} className="mt-5" />
        ) : (
          <>
            <TabPanel value="account" className="pt-5"><AccountTab me={me} tz={tz} /></TabPanel>
            <TabPanel value="notifications" className="pt-5"><NotificationsTab me={me} /></TabPanel>
            <TabPanel value="privacy" className="pt-5"><PrivacyTab /></TabPanel>
          </>
        )}
      </Tabs>
    </div>
  );
};
