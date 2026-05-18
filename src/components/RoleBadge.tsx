'use client';

interface RoleBadgeProps {
  role: 'user' | 'admin' | 'super_admin';
}

const roleConfig = {
  user: {
    label: 'User',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-violet-50 text-violet-700 border border-violet-200',
  },
  super_admin: {
    label: 'Super Admin',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.user;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
