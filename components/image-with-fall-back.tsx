'use client';
import React, { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends ImageProps {
  type: 'user' | 'job';
}

const ImageWithFallback = React.forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, type, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState<string>(src as string);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      setImgSrc(src as string);
      setIsLoading(true);
    }, [src]);

    const jobFallback = '/JobPlaceholder.webp';
    const userFallback = '/UserPlaceholder.webp';

    return (
      <div className="relative h-full w-full">
        <Image
          ref={ref}
          alt={alt}
          src={imgSrc}
          className={cn(`${isLoading && 'blur-2xl grayscale'}`, props.className)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImgSrc(type === 'user' ? userFallback : jobFallback);
          }}
          style={{ objectFit: 'cover' }}
          loading="lazy"
          fill={true}
          {...props}
        />
      </div>
    );
  }
);

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;
