/**
 * Candidate Portal — Tailwind theme
 *
 * Every value here is lifted verbatim from the HTML design reference.
 * Use these token names in components; never hand-type a hex.
 *
 * Requires: tailwindcss ^3.4
 * Do NOT add @tailwindcss/forms — it restyles inputs and fights the
 * design's specific 42px height / 9px radius / #D9E0EA border treatment.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Text
        ink: {
          DEFAULT: '#0F1B2D',   // primary text, dark avatars, toast bg
          secondary: '#5A6675', // supporting copy, inactive nav
          muted: '#8A94A3',     // meta, timestamps, helper text
          subtle: '#A9B4C2',    // dismiss glyphs
          faint: '#A3ACB9',     // inactive step labels
          disabled: '#C4CFDD',  // disabled dates, disabled arrows
          chip: '#334155',      // skill chip / consent copy
          slate: '#7B8794'      // neutral pill text, dropdown meta
        },
        // Brand accent
        accent: {
          DEFAULT: '#3A6FF7',
          hover: '#2A55C8',
          disabled: '#AFC3EE',
          tint: '#EEF3FE',      // icon backgrounds, soft pills
          tintStrong: '#DCE6FB',// unread notification border
          wash: '#F5F8FF',      // selected slot summary panel
          row: '#F8FAFF',       // unread notification row
          locked: '#C9D8F8'     // always-on (locked) switch track
        },
        // Surfaces
        surface: {
          page: '#F7F9FC',
          card: '#FFFFFF',
          sunken: '#FAFBFD',    // disabled cells, muted banner
          hover: '#F6F8FB',      // default control hover
          hoverAlt: '#F4F7FB',   // menu item hover
          hoverSoft: '#F8FAFC',  // accordion row hover
          preview: '#EDF1F6'     // document preview desk
        },
        // Borders — always these, never a saturated color
        line: {
          card: '#E7ECF2',
          inner: '#EEF1F6',      // divider inside a card
          list: '#F2F5F9',       // row divider in a list
          listSoft: '#F3F6FA',
          input: '#DDE3EB',
          control: '#D9E0EA',
          controlHover: '#C4CFDD',
          menu: '#E4E9F0',
          chip: '#E1E7EF'
        },
        success: {
          DEFAULT: '#1E7A46',
          bg: '#E8F3EC',
          bgAlt: '#F1F8F3',
          border: '#CFE6D8',
          text: '#33604A'
        },
        warning: {
          DEFAULT: '#B26A00',
          bg: '#FFF6E8',
          bgAlt: '#FFFBF3',
          border: '#F2DFB8',
          text: '#8A5A00'
        },
        danger: {
          DEFAULT: '#B4231C',
          hover: '#96201A',
          bg: '#FDF6F5',
          bgAlt: '#FDF3F2',
          border: '#F0D8D5',
          borderStrong: '#E4BCB8',
          text: '#7A2E29',
          heading: '#7A2E29',
          disabled: '#E0A9A5'
        },
        // Login context panel only — the three feature dots. README specifies
        // these two hexes; accent covers the third.
        authdot: {
          amber: '#E0A33A',
          green: '#3EA76B'
        },
        neutral: {
          pill: '#F1F4F8',       // neutral chip bg, icon tile bg
          track: '#CBD3DE',      // switch off track
          dot: '#C9D3E0',        // inactive timeline dot
          bar: '#EDF1F6',        // progress bar track
          knob: '#E4E9F0'        // chip remove button
        }
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing }]
        'meta-xs': ['11.5px', { lineHeight: '1.4' }],
        'meta': ['12px', { lineHeight: '1.4' }],
        'meta-lg': ['12.5px', { lineHeight: '1.45' }],
        'label': ['12px', { lineHeight: '1' }],
        'label-lg': ['12.5px', { lineHeight: '1' }],
        'overline': ['11px', { lineHeight: '1', letterSpacing: '0.06em' }],
        'overline-sm': ['10.5px', { lineHeight: '1', letterSpacing: '0.05em' }],
        'pill': ['10.5px', { lineHeight: '1', letterSpacing: '0.07em' }],
        'body-sm': ['13px', { lineHeight: '1.55' }],
        'body': ['13.5px', { lineHeight: '1.55' }],
        'body-lg': ['14px', { lineHeight: '1.5' }],
        'item': ['14.5px', { lineHeight: '1.35' }],
        'card-title': ['15.5px', { lineHeight: '1.3' }],
        'value': ['17px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'value-lg': ['19px', { lineHeight: '1.25', letterSpacing: '-0.012em' }],
        'modal-title': ['20px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'page-title': ['25px', { lineHeight: '1.2', letterSpacing: '-0.018em' }],
        'auth-title': ['27px', { lineHeight: '1.2', letterSpacing: '-0.018em' }],
        'timeline-date': ['10.5px', { lineHeight: '1', letterSpacing: '0.08em' }]
      },
      borderRadius: {
        tag: '5px',
        menuitem: '7px',
        icon: '8px',
        control: '9px',
        button: '10px',
        menu: '11px',
        card: '12px',
        modal: '14px'
      },
      spacing: {
        card: 'clamp(18px, 2vw, 22px)',   // card padding
        modal: 'clamp(22px, 3vw, 28px)'   // modal padding
      },
      height: {
        'ctl-xs': '32px',
        'ctl-sm': '34px',
        'ctl': '36px',
        'ctl-md': '38px',
        'ctl-lg': '40px',
        'field': '42px',
        'tab': '44px',
        'btn-lg': '46px',
        'field-lg': '48px',
        tabbar: '66px'
      },
      boxShadow: {
        modal: '0 24px 60px -16px rgba(15,27,45,.45)',
        menu: '0 12px 32px -10px rgba(15,27,45,.22), 0 2px 6px rgba(15,27,45,.06)',
        'menu-sm': '0 12px 30px -10px rgba(15,27,45,.22)',
        toast: '0 14px 34px -12px rgba(15,27,45,.5)',
        float: '0 20px 50px -24px rgba(15,27,45,.28)',
        paper: '0 6px 20px -8px rgba(15,27,45,.25)',
        knob: '0 1px 3px rgba(15,27,45,.3)',
        focus: '0 0 0 3px rgba(58,111,247,.14)',
        'focus-danger': '0 0 0 3px rgba(180,35,28,.12)'
      },
      backgroundColor: {
        scrim: 'rgba(15,27,45,.44)',
        'scrim-strong': 'rgba(15,27,45,.52)'
      },
      transitionDuration: {
        control: '150ms',  // background / border / color
        toggle: '180ms',   // switch knob
        bar: '300ms'       // progress width
      },
      screens: {
        // The ONLY breakpoint the design uses. Below it: bottom tab bar,
        // drawer nav, two-pane views collapse to single pane.
        app: '900px'
      },
      maxWidth: {
        'page-narrow': '680px',   // Help
        'page-mid': '820px',      // Offer
        'page': '860px',          // Notifications
        'page-wide': '880px',     // Settings, app detail
        'page-docs': '960px',     // Documents
        'page-full': '1180px'     // Profile
      }
    }
  },
  plugins: []
};
