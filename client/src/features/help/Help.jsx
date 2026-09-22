import { useState } from 'react';
import { Link } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import { useQuery } from '@tanstack/react-query';

import { Button, Card, Skeleton } from '../../components/primitives/index.js';
import { PageHeader } from '../../components/shared/PageHeader.jsx';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';
import { cn } from '../../lib/cn.js';

const useFaq = () =>
  useQuery({
    queryKey: qk.faq,
    queryFn: async () => (await api.get('/faq')).data,
    staleTime: Infinity // The corpus is fixed.
  });

export const Help = () => {
  const [query, setQuery] = useState('');
  const { data, isPending } = useFaq();

  const term = query.trim().toLowerCase();
  const matches = (data?.items ?? []).filter(
    (f) => !term || f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
  );

  return (
    <div className="mx-auto max-w-page-narrow">
      <PageHeader
        title="Help &amp; Candidate FAQ"
        sub="Answers to the questions candidates ask most."
      />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search help topics"
        aria-label="Search help topics"
        className="mb-5 h-[46px] w-full rounded-control border border-line-input bg-surface-card px-3.5 text-body text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-control focus:border-accent focus:shadow-focus focus:outline-none"
      />

      <Card className="p-0">
        {isPending ? (
          <div className="p-card">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="mb-3 h-6 w-2/3" />)}
          </div>
        ) : matches.length === 0 ? (
          <p className="px-[18px] py-6 text-body text-ink-secondary">
            No topics match “{query}”. Try a different word, or message your recruiter below.
          </p>
        ) : (
          <Accordion.Root type="single" collapsible>
            {matches.map((f) => (
              <Accordion.Item key={f.slug} value={f.slug} className="border-b border-line-list last:border-b-0">
                <Accordion.Header asChild>
                  <h2>
                  <Accordion.Trigger
                    className={cn(
                      'group flex w-full items-center justify-between gap-4 px-[18px] py-4 text-left',
                      'text-[13.5px] font-medium leading-[1.45] text-ink',
                      'transition-[background-color] duration-control hover:bg-surface-hoverSoft',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                      'data-[state=open]:font-semibold'
                    )}
                  >
                    {f.q}
                    {/* A plain +/− rather than a rotating chevron, per the design. */}
                    <span aria-hidden="true" className="shrink-0 text-[20px] leading-none text-ink-muted">
                      <span className="group-data-[state=open]:hidden">+</span>
                      <span className="hidden group-data-[state=open]:inline">−</span>
                    </span>
                  </Accordion.Trigger>
                  </h2>
                </Accordion.Header>
                <Accordion.Content className="pb-[18px] pl-[18px] pr-[52px] text-[13.5px] leading-[1.65] text-ink-secondary">
                  {f.a}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </Card>

      <Card className="mt-3.5">
        <h2 className="text-card-title font-semibold text-ink">Still need help?</h2>
        <p className="mt-1.5 text-body-sm text-ink-secondary">
          Your recruiter replies within one business day.
        </p>
        <Link to="/messages" className="mt-4 inline-block">
          <Button variant="primary" size="md" tabIndex={-1}>Message recruiting</Button>
        </Link>
      </Card>
    </div>
  );
};
