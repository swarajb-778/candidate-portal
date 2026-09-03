import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Without this, tailwind-merge classifies custom names by shape alone:
// `text-pill` looks like a text colour, so `cn('text-pill', 'text-ink-slate')`
// silently drops the font size. Same trap for shadows. Every token scale in
// tailwind.config.js is declared here so cn() resolves conflicts correctly.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{
        text: [
          'meta-xs', 'meta', 'meta-lg', 'label', 'label-lg', 'overline', 'overline-sm',
          'pill', 'body-sm', 'body', 'body-lg', 'item', 'card-title', 'value', 'value-lg',
          'modal-title', 'page-title', 'auth-title', 'timeline-date'
        ]
      }],
      rounded: [{ rounded: ['tag', 'menuitem', 'icon', 'control', 'button', 'menu', 'card', 'modal'] }],
      'shadow': [{ shadow: ['modal', 'menu', 'menu-sm', 'toast', 'float', 'paper', 'knob', 'focus', 'focus-danger'] }],
      h: [{ h: ['ctl-xs', 'ctl-sm', 'ctl', 'ctl-md', 'ctl-lg', 'field', 'tab', 'btn-lg', 'field-lg', 'tabbar'] }],
      p: [{ p: ['card', 'modal'] }],
      px: [{ px: ['card', 'modal'] }],
      py: [{ py: ['card', 'modal'] }],
      'max-w': [{ 'max-w': ['page-narrow', 'page-mid', 'page', 'page-wide', 'page-docs', 'page-full'] }],
      'transition-duration': [{ duration: ['control', 'toggle', 'bar'] }]
    }
  }
});

export const cn = (...inputs) => twMerge(clsx(inputs));
