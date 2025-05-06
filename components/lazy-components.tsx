import dynamic from 'next/dynamic';
import React from 'react';

// Types pour les composants lazy-loaded
type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type QuizProps = {
  data: any;
  cardId?: string;
  onComplete?: (points: number) => void;
};

type MediaPlayerProps = {
  url: string;
  className?: string;
};

type OpenGraphPreviewProps = {
  url: string;
  className?: string;
};

type ComposeBoxProps = {
  onSubmit: (content: string) => void;
  placeholder?: string;
  className?: string;
};

// Lazy-loaded components with loading fallbacks
export const LazyAuthModal = dynamic<AuthModalProps>(
  () => import('./auth-modal').then(mod => mod.default || mod),
  {
    loading: () => <div className="w-full h-full flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>,
    ssr: false, // Désactiver le SSR pour ce composant qui dépend du navigateur
  }
);

export const LazyQuiz = dynamic<QuizProps>(
  () => import('./quiz').then(mod => mod.default || mod),
  {
    loading: () => <div className="w-full p-4 rounded-md border border-border bg-card"><div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2"></div><div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div></div>,
  }
);

export const LazyMediaPlayer = dynamic<MediaPlayerProps>(
  () => import('./media-player').then(mod => mod.default || mod),
  {
    loading: () => <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center"><div className="animate-pulse h-12 w-12 rounded-full bg-background/50"></div></div>,
    ssr: false, // Désactiver le SSR pour éviter les problèmes avec les API du navigateur
  }
);

export const LazyOpenGraphPreview = dynamic<OpenGraphPreviewProps>(
  () => import('./open-graph-preview').then(mod => mod.default || mod),
  {
    loading: () => <div className="w-full p-4 border rounded-md border-border"><div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2"></div><div className="h-20 bg-muted rounded animate-pulse"></div></div>,
  }
);

export const LazyComposeBox = dynamic<ComposeBoxProps>(
  () => import('./compose-box').then(mod => mod.default || mod),
  {
    loading: () => <div className="w-full p-4 border rounded-md border-border bg-card"><div className="h-24 bg-muted rounded animate-pulse"></div></div>,
  }
);
