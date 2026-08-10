export default {
  theme: {
    extend: {
      colors: {
        'rds-surface': 'hsl(var(--rds-surface) / <alpha-value>)',
        'rds-hairline': 'hsl(var(--rds-hairline) / <alpha-value>)',
        'rds-hairline-strong': 'hsl(var(--rds-hairline-strong) / <alpha-value>)',
        'rds-surface-panel': 'hsl(var(--rds-surface-panel) / <alpha-value>)',
        'rds-surface-panel-2': 'hsl(var(--rds-surface-panel-2) / <alpha-value>)',
        'rds-surface-panel-3': 'hsl(var(--rds-surface-panel-3) / <alpha-value>)',
        'rds-ink': 'hsl(var(--rds-ink) / <alpha-value>)',
        'rds-ink-muted': 'hsl(var(--rds-ink-muted) / <alpha-value>)',
        'rds-ink-dim': 'hsl(var(--rds-ink-dim) / <alpha-value>)',
        'rds-accent': 'hsl(var(--rds-accent) / <alpha-value>)',
        'rds-positive': 'hsl(var(--rds-positive) / <alpha-value>)',
        'rds-warning': 'hsl(var(--rds-warning) / <alpha-value>)',
        'rds-danger': 'hsl(var(--rds-danger) / <alpha-value>)',
      },
      borderRadius: {
        rds: 'var(--rds-radius)',
        'rds-lg': 'var(--rds-radius-lg)',
      },
    },
  },
}
