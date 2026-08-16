import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
}

export default function LazyImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 w-full h-full ${className || ''}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        {...props}
      />
    </div>
  );
}
