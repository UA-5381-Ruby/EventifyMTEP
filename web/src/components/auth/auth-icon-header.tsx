interface AuthIconHeaderProps {
  icon: React.ReactNode;
  /** Tailwind bg class, e.g. 'bg-green-50' */
  iconBg: string;
  title: string;
  /** Tailwind text color class for the title, e.g. 'text-green-900' */
  titleColor?: string;
  description: React.ReactNode;
  /** Tailwind text color class for the description, e.g. 'text-green-800' */
  descriptionColor?: string;
}

export function AuthIconHeader({
  icon,
  iconBg,
  title,
  titleColor = 'text-neutral-900',
  description,
  descriptionColor = 'text-neutral-600',
}: AuthIconHeaderProps) {
  return (
    <>
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${iconBg} mb-4`}
      >
        {icon}
      </div>
      <h1 className={`text-2xl font-bold ${titleColor} mb-2`}>{title}</h1>
      <p className={`${descriptionColor} mb-6`}>{description}</p>
    </>
  );
}
