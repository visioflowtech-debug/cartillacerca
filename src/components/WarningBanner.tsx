interface WarningBannerProps {
  children: React.ReactNode;
  tone?: 'warning' | 'info';
}

export function WarningBanner({ children, tone = 'warning' }: WarningBannerProps) {
  return <div className={`warning-banner warning-banner--${tone}`}>{children}</div>;
}
