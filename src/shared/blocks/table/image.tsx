import { LazyImage } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';

export function Image({
  value,
  metadata,
  placeholder,
  className,
}: {
  value: string;
  metadata?: Record<string, any>;
  placeholder?: string;
  className?: string;
}) {
  if (!value) {
    if (placeholder) {
      return <div className={className}>{placeholder}</div>;
    }

    return null;
  }

  const width = metadata?.width || 60;
  const height = metadata?.height || 40;

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden',
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
      }}
    >
      <LazyImage
        src={value}
        alt={value}
        width={width}
        height={height}
        className="h-full w-full rounded-md object-cover"
      />
    </div>
  );
}
