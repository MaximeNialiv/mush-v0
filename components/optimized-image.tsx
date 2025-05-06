"use client"

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fallbackSrc?: string;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width = 0,
  height = 0,
  className = '',
  priority = false,
  quality = 75,
  fallbackSrc = '/placeholder.svg',
  onError,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Vérifier si l'URL est externe
  const isExternal = src.startsWith('http') || src.startsWith('https');
  
  // Vérifier si l'URL est une image de YouTube
  const isYouTubeImage = src.includes('img.youtube.com');

  // Gérer les erreurs de chargement d'image
  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImgSrc(fallbackSrc);
      if (onError) onError();
    }
  };

  // Si c'est une URL externe ou une image YouTube, utiliser un élément img standard
  // car Next.js Image nécessite une configuration pour les domaines externes
  if (isExternal || isYouTubeImage) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={width || undefined}
        height={height || undefined}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={handleError}
      />
    );
  }

  // Pour les images locales, utiliser le composant Image de Next.js
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || undefined}
      height={height || undefined}
      className={className}
      priority={priority}
      quality={quality}
      onError={handleError}
    />
  );
}
