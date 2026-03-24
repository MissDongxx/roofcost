import { useFormatter } from 'next-intl';

export function Time({
  value,
  placeholder,
  metadata,
  className,
}: {
  value: string | Date;
  placeholder?: string;
  metadata?: Record<string, any>;
  className?: string;
}) {
  const format = useFormatter();

  if (!value) {
    if (placeholder) {
      return <div className={className}>{placeholder}</div>;
    }

    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return (
    <div className={className}>
      {metadata?.format
        ? format.dateTime(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...metadata?.options, // Allow overriding or passing more options
          })
        : format.relativeTime(date)}
    </div>
  );
}
