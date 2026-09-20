import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useDispatch } from 'react-redux';
import { Check, FileText, Folder, MoreVertical, Plus } from 'lucide-react';

import {
  Button, Card, EmptyState, SkeletonCard, Tab, TabList, TabPanel, Tabs
} from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { useFilterParams } from '../../lib/useFilterParams.js';
import { openModal, showToast } from '../../store/slices/ui.js';
import { useZone } from '../auth/queries.js';
import { useDeleteDocument, useDocuments, downloadUrl } from './queries.js';
import { fileMeta, fmtCalendarShort, fmtDate } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

export const Documents = () => {
  const dispatch = useDispatch();
  const [{ tab }, update] = useFilterParams('documents', ['tab']);

  return (
    <div className="mx-auto max-w-page-docs">
      <PageHeader
        title="Documents"
        sub="Manage documents associated with your applications."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatch(openModal({ modal: 'upload', payload: { intent: 'new' } }))}
          >
            <Plus aria-hidden="true" size={15} strokeWidth={1.8} />
            Upload document
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => update({ tab: v })}>
        <TabList>
          <Tab value="mine">My Documents</Tab>
          <Tab value="requested">Requested Documents</Tab>
        </TabList>
        <TabPanel value="mine" className="pt-5"><MyDocuments /></TabPanel>
        <TabPanel value="requested" className="pt-5"><RequestedDocuments /></TabPanel>
      </Tabs>
    </div>
  );
};

const MyDocuments = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  const { data, isPending } = useDocuments('mine');

  if (isPending) return <div className="flex flex-col gap-3.5"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>;

  if (!data.items.length) {
    return (
      <Card className="p-0">
        <EmptyState
          icon={FileText}
          title="No documents yet"
          body="A resume is required before you can submit an application."
          action={
            <Button variant="primary" onClick={() => dispatch(openModal({ modal: 'upload', payload: { intent: 'new' } }))}>
              Upload a document
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {data.items.map((d) => <DocumentCard key={d.slug} doc={d} tz={tz} />)}
    </div>
  );
};

const DocumentCard = ({ doc, tz }) => {
  const dispatch = useDispatch();
  const remove = useDeleteDocument();

  return (
    <Card>
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-icon bg-neutral-pill text-ink-secondary">
          <FileText aria-hidden="true" size={18} strokeWidth={1.6} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-item font-semibold text-ink">{doc.name}</span>
            <span className="rounded-tag bg-neutral-pill px-1.5 py-1 text-overline-sm font-medium uppercase text-ink-slate">
              {doc.kind}
            </span>
          </p>
          <p className="mt-1.5 text-meta text-ink-muted">
            {fileMeta(doc.mimeType, doc.sizeBytes)} · Uploaded {fmtDate(doc.uploadedAt, tz)}
          </p>
          {doc.usedFor?.length > 0 && (
            <p className="mt-1.5 text-meta text-ink-secondary">
              Used for: {doc.usedFor.map((a) => a.title).join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(openModal({ modal: 'docPreview', payload: { slug: doc.slug, name: doc.name } }))}
          >
            Preview
          </Button>
          <a href={downloadUrl(doc.slug)} download onClick={() => dispatch(showToast(`${doc.name} downloaded`))}>
            <Button variant="secondary" size="sm" tabIndex={-1}>Download</Button>
          </a>

          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button variant="secondary" iconOnly size="sm" aria-label={`Actions for ${doc.name}`} className="rounded-control">
                <MoreVertical aria-hidden="true" size={16} strokeWidth={1.6} />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={6}
                className="z-50 w-[190px] rounded-menu border border-line-menu bg-surface-card p-1.5 shadow-menu"
              >
                <Dropdown.Item
                  className="cursor-pointer rounded-menuitem px-2.5 py-2 text-body text-ink outline-none transition-[background-color] duration-control data-[highlighted]:bg-surface-hoverAlt"
                  onSelect={() =>
                    dispatch(openModal({
                      modal: 'upload',
                      payload: { intent: doc.kind === 'Resume' ? 'resume' : 'replace', replaceSlug: doc.slug }
                    }))
                  }
                >
                  Replace file
                </Dropdown.Item>
                <Dropdown.Separator className="my-1.5 h-px bg-line-inner" />
                <Dropdown.Item
                  className="cursor-pointer rounded-menuitem px-2.5 py-2 text-body text-danger outline-none transition-[background-color] duration-control data-[highlighted]:bg-danger-bgAlt"
                  onSelect={() =>
                    remove.mutate(doc.slug, { onSuccess: () => dispatch(showToast(`${doc.name} deleted`)) })
                  }
                >
                  Delete
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>
      </div>
    </Card>
  );
};

const RequestedDocuments = () => {
  const dispatch = useDispatch();
  const tz = useZone();
  const { data, isPending } = useDocuments('requested');

  if (isPending) return <SkeletonCard lines={3} />;

  if (!data.items.length) {
    return (
      <Card className="p-0">
        <EmptyState
          icon={Folder}
          title="Nothing requested"
          body="When a hiring team needs a file from you, it shows up here."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {data.items.map((doc) => {
        const done = doc.request?.fulfilled;
        return (
          <Card key={doc.slug} className={cn(done ? 'border-success-border bg-success-bgAlt' : 'border-warning-border bg-warning-bgAlt')}>
            <div className="flex flex-wrap items-start gap-4">
              <span
                className={cn(
                  'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-icon',
                  done ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                )}
              >
                {done ? <Check aria-hidden="true" size={18} strokeWidth={2.2} /> : <Folder aria-hidden="true" size={18} strokeWidth={1.6} />}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-item font-semibold text-ink">{doc.name}</p>
                <p className={cn('mt-1.5 text-meta-lg', done ? 'text-success-text' : 'text-warning-text')}>
                  {done
                    ? `Uploaded ${fmtDate(doc.uploadedAt, tz)}`
                    : `Requested by ${doc.request.requestedBy} · Due ${fmtCalendarShort(doc.request.dueAt)}`}
                </p>
                {doc.request?.note && !done && (
                  <p className="mt-1.5 text-body-sm text-ink-secondary">{doc.request.note}</p>
                )}
              </div>

              {!done && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    dispatch(openModal({ modal: 'upload', payload: { intent: 'request', replaceSlug: doc.slug } }))
                  }
                >
                  Upload
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
