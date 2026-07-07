import * as React from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconApps,
  IconBell,
  IconBrandTiktok,
  IconBrandWechat,
  IconBrandWeibo,
  IconCards,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircle,
  IconCircleFilled,
  IconDots,
  IconFlame,
  IconHome,
  IconLayoutDashboard,
  IconLoader2,
  IconLock,
  IconMail,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconSparkles,
  IconTargetArrow,
  IconUser,
  IconX,
} from '@tabler/icons-react';

const iconRegistry = {
  alertCircle: IconAlertCircle,
  alertTriangle: IconAlertTriangle,
  app: IconLayoutDashboard,
  apps: IconApps,
  bell: IconBell,
  brandTiktok: IconBrandTiktok,
  brandWechat: IconBrandWechat,
  brandWeibo: IconBrandWeibo,
  cards: IconCards,
  check: IconCheck,
  chevronDown: IconChevronDown,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  chevronUp: IconChevronUp,
  circle: IconCircle,
  circleFilled: IconCircleFilled,
  close: IconX,
  dots: IconDots,
  flame: IconFlame,
  home: IconHome,
  loader: IconLoader2,
  lock: IconLock,
  mail: IconMail,
  refresh: IconRefresh,
  search: IconSearch,
  settings: IconSettings,
  shoppingCart: IconShoppingCart,
  sparkles: IconSparkles,
  target: IconTargetArrow,
  user: IconUser,
  x: IconX,
} as const;

export type IconName = keyof typeof iconRegistry;

type TablerIconComponent = React.ComponentType<
  Omit<React.SVGProps<SVGSVGElement>, 'stroke'> & {
    size?: number | string;
    stroke?: number | string;
    title?: string;
  }
>;

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'children' | 'name' | 'stroke'> {
  name: IconName;
  size?: 16 | 20 | 24 | number | string;
  stroke?: number | string;
  label?: string;
}

export function Icon({
  name,
  size = 20,
  stroke = 1.75,
  label,
  role,
  ...props
}: IconProps) {
  const Component = iconRegistry[name] as TablerIconComponent;

  return (
    <Component
      aria-hidden={label ? undefined : true}
      aria-label={label}
      focusable="false"
      role={label ? (role ?? 'img') : role}
      size={size}
      stroke={stroke}
      {...props}
    />
  );
}

