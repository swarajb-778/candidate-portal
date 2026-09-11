import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Bell, Download, FileText, MoreVertical, Plus, Upload } from 'lucide-react';

import {
  Button, Card, CardDivider, CardHeader, EmptyState, Field, LockedSwitch, Modal,
  ModalClose, Select, Skeleton, SkeletonCard, Spinner, StatusPill, Switch,
  Tab, TabList, TabPanel, Tabs, Toast
} from '../../components/primitives/index.js';
import { showToast } from '../../store/slices/ui.js';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
const STATUSES = [
  'Draft', 'Submitted', 'Under Review', 'Interview', 'Offer', 'Hired', 'Not Selected', 'Withdrawn'
];

const Section = ({ title, note, children }) => (
  <section className="mt-8 first:mt-0">
    <h2 className="text-card-title font-semibold text-ink">{title}</h2>
    {note && <p className="mt-1 text-meta-lg text-ink-muted">{note}</p>}
    <div className="mt-3.5">{children}</div>
  </section>
);

const Row = ({ label, children }) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-line-list py-3 last:border-b-0">
    <span className="w-[132px] shrink-0 text-overline-sm font-medium uppercase text-ink-muted">
      {label}
    </span>
    <div className="flex flex-wrap items-center gap-2.5">{children}</div>
  </div>
);

export const KitchenSink = () => {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(null);
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [zone, setZone] = useState('America/Los_Angeles');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto max-w-page-full px-card py-8">
      <header>
        <h1 className="text-page-title font-semibold text-ink">Kitchen sink</h1>
        <p className="mt-2 text-body-lg text-ink-secondary">
          Every primitive, every variant, every state — built against the token names only.
        </p>
      </header>

      <div className="mt-5 space-y-3.5">
        <Card>
          <Section title="Button" note="4 variants × 5 sizes, plus states.">
            {VARIANTS.map((v) => (
              <Row key={v} label={v}>
                {SIZES.map((s) => (
                  <Button key={s} variant={v} size={s}>
                    {s.toUpperCase()} button
                  </Button>
                ))}
              </Row>
            ))}
            <Row label="disabled">
              {VARIANTS.map((v) => (
                <Button key={v} variant={v} disabled>
                  Disabled
                </Button>
              ))}
            </Row>
            <Row label="loading">
              {VARIANTS.map((v) => (
                <Button key={v} variant={v} loading>
                  Submitting
                </Button>
              ))}
            </Row>
            <Row label="icon only">
              <Button variant="ghost" iconOnly size="md" aria-label="Notifications"><Bell aria-hidden="true" size={18} strokeWidth={1.6} /></Button>
              <Button variant="secondary" iconOnly size="sm" aria-label="More"><MoreVertical aria-hidden="true" size={16} strokeWidth={1.6} /></Button>
              <Button variant="primary" iconOnly size="lg" aria-label="Add"><Plus aria-hidden="true" size={18} strokeWidth={1.6} /></Button>
            </Row>
            <Row label="with icon">
              <Button variant="secondary"><Download aria-hidden="true" size={15} strokeWidth={1.6} />Download</Button>
              <Button variant="primary"><Upload aria-hidden="true" size={15} strokeWidth={1.6} />Upload document</Button>
              <Button variant="secondary">View application →</Button>
            </Row>
            <Row label="ghost tones">
              <Button variant="ghost" className="text-accent hover:bg-accent-tint hover:text-accent-hover">View all →</Button>
              <Button variant="ghost" className="text-danger hover:bg-danger-bgAlt hover:text-danger-hover">Withdraw application</Button>
            </Row>
            <Row label="full width">
              <div className="w-[280px]"><Button variant="primary" size="xl" fullWidth>Sign in</Button></div>
            </Row>
          </Section>
        </Card>

        <Card>
          <Section title="StatusPill" note="Every status, plus the stage-label override Overview uses.">
            <div className="flex flex-wrap items-center gap-2.5">
              {STATUSES.map((s) => <StatusPill key={s} status={s} />)}
              <StatusPill status="Interview" label="Panel interview" />
            </div>
          </Section>
        </Card>

        <Card>
          <Section title="Card" note="No shadow — a 1px line-card border does the work.">
            <Card className="bg-surface-page">
              <CardHeader title="My Applications" action={<Button variant="ghost" size="sm" className="text-accent hover:bg-accent-tint hover:text-accent-hover">View all →</Button>} />
              <CardDivider className="my-3.5" />
              <p className="text-body text-ink-secondary">Card body, with an inner divider above.</p>
            </Card>
          </Section>
        </Card>

        <Card>
          <Section title="Field" note="42px default, 48px on the auth screens.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" placeholder="you@example.com" defaultValue="swaraj@example.com" />
              <Field
                size="lg"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                defaultValue="portal1234"
                labelAction={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-label font-medium text-accent hover:text-accent-hover">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                }
              />
              <Field label="Phone" hint="Used only for interview reminders." placeholder="+1 (650) 555-0148" />
              <Field label="Full legal name" error="Type your name exactly as it appears on your profile." defaultValue="S. Bangar" />
              <Field label="Location" disabled defaultValue="San Jose, CA" />
              <Field as="textarea" label="Reason" rows={3} placeholder="Helps the team improve — never shared with the hiring manager." />
            </div>
          </Section>
        </Card>

        <Card>
          <Section title="Select">
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Time zone" value={zone} onValueChange={setZone} options={['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Kolkata']} />
              <Select label="Date format" placeholder="Choose a format" options={['MM/DD/YYYY', 'DD.MM.YYYY']} error="Pick a format." />
              <Select label="Summary email" disabled placeholder="Weekly on Monday" options={['Off', 'Daily', 'Weekly on Monday']} />
            </div>
          </Section>
        </Card>

        <Card>
          <Section title="Switch" note="42×24 track, 18px knob. The locked one is not a button at all.">
            <Row label="off"><Switch checked={off} onCheckedChange={setOff} label="Demo switch, off" /></Row>
            <Row label="on"><Switch checked={on} onCheckedChange={setOn} label="Demo switch, on" /></Row>
            <Row label="disabled"><Switch checked={false} disabled label="Disabled switch" /><Switch checked disabled label="Disabled switch, on" /></Row>
            <Row label="locked on"><LockedSwitch /></Row>
          </Section>
        </Card>

        <Card>
          <Section title="Tabs">
            <Tabs defaultValue="overview">
              <TabList>
                <Tab value="overview">Overview</Tab>
                <Tab value="timeline">Timeline</Tab>
                <Tab value="documents">Documents</Tab>
                <Tab value="interviews">Interviews</Tab>
                <Tab value="notes">Notes</Tab>
              </TabList>
              {['overview', 'timeline', 'documents', 'interviews', 'notes'].map((v) => (
                <TabPanel key={v} value={v} className="pt-4 text-body text-ink-secondary">
                  Panel content for <span className="font-medium text-ink">{v}</span>.
                </TabPanel>
              ))}
            </Tabs>
          </Section>
        </Card>

        <Card>
          <Section title="Modal" note="Escape and overlay click close every one. Focus returns to the trigger.">
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => setModal('sm')}>440px — success</Button>
              <Button onClick={() => setModal('md')}>472px — destructive</Button>
              <Button onClick={() => setModal('lg')}>560px — with close button</Button>
            </div>
          </Section>
        </Card>

        <Card>
          <Section title="Toast" note="role=status, aria-live=polite, auto-dismisses at 2800ms.">
            <Button onClick={() => dispatch(showToast('Resume_Swaraj_Bangar.pdf downloaded'))}>Fire a toast</Button>
          </Section>
        </Card>

        <Card>
          <Section title="EmptyState">
            <EmptyState
              icon={Bell}
              title="No notifications"
              body="You're all caught up. New updates about your applications will show up here."
              action={<Button variant="secondary">Show all notifications</Button>}
            />
          </Section>
        </Card>

        <Card>
          <Section title="Skeleton and Spinner" note="Skeletons are static — the spec allows four durations and one spinner.">
            <div className="space-y-3.5">
              <SkeletonCard />
              <SkeletonCard lines={4} />
              <div className="flex items-center gap-4">
                <Spinner className="text-accent" />
                <Spinner className="h-5 w-5 text-ink-muted" />
                <Skeleton className="h-[15px] w-40" />
                <span className="inline-flex items-center gap-2 text-body-sm text-ink-secondary">
                  <Spinner className="text-ink-muted" /> Preparing your file. This usually takes a minute.
                </span>
              </div>
            </div>
          </Section>
        </Card>
      </div>

      <Modal
        open={modal === 'sm'}
        onOpenChange={(v) => !v && setModal(null)}
        maxWidth="max-w-[440px]"
        title="Availability sent"
        description="Recruiting builds the panel day from the times you sent."
        footer={<ModalClose asChild><Button variant="primary" size="lg" fullWidth>Done</Button></ModalClose>}
      >
        <div className="rounded-control bg-surface-page p-3.5 text-body-sm text-ink-secondary">
          Wed, Aug 26 · 9:00 AM PDT<br />Thu, Aug 27 · 1:00 PM PDT
        </div>
      </Modal>

      <Modal
        open={modal === 'md'}
        onOpenChange={(v) => !v && setModal(null)}
        maxWidth="max-w-[472px]"
        title="Withdraw this application?"
        footer={
          <>
            <ModalClose asChild><Button variant="secondary" size="lg">Keep application</Button></ModalClose>
            <Button variant="danger" size="lg">Withdraw application</Button>
          </>
        }
      >
        <p className="text-body font-medium text-ink">Senior Software Engineer</p>
        <p className="text-meta text-ink-muted">Command Center</p>
        <div className="mt-3.5 rounded-button border border-danger-border bg-danger-bg p-3.5 text-body-sm text-danger-text">
          This can’t be undone. Recruiting will be notified, any scheduled interviews will be
          cancelled, and you’ll need to reapply if you change your mind.
        </div>
      </Modal>

      <Modal
        open={modal === 'lg'}
        onOpenChange={(v) => !v && setModal(null)}
        showClose
        title="Resume_Swaraj_Bangar.pdf"
        footer={<ModalClose asChild><Button variant="secondary" size="lg">Close</Button></ModalClose>}
      >
        <div className="flex items-center justify-center rounded-control bg-surface-preview p-6">
          <div className="flex aspect-[8.5/11] w-full max-w-[360px] items-center justify-center rounded-tag bg-surface-card shadow-paper">
            <FileText aria-hidden="true" size={28} strokeWidth={1.4} className="text-ink-disabled" />
          </div>
        </div>
        <p className="mt-4 border-t border-line-inner pt-3.5 text-meta text-ink-muted">
          Preview only — download for the full document.
        </p>
      </Modal>

      <Toast />
    </div>
  );
};
