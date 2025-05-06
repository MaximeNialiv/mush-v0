/**
 * Utilitaires de cache pour l'application Mush
 * Permet de mettre en cache des données côté client pour réduire les appels API
 */

// Type pour les métadonnées OpenGraph
export interface OGMetadata {
  title: string;
  image: string;
  description: string;
  favicon: string;
  domain: string;
  timestamp?: number;
}

// Préfixe pour les clés de cache
const CACHE_PREFIX = 'mush_cache_';
// Durée de validité du cache en millisecondes (24 heures)
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Récupère des données du cache
 * @param key Clé de cache
 * @returns Données en cache ou null si non trouvées ou expirées
 */
export function getFromCache<T>(key: string): T | null {
  try {
    // Vérifier si le localStorage est disponible
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cachedData);
    const now = Date.now();

    // Vérifier si les données sont expirées
    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

/**
 * Stocke des données dans le cache
 * @param key Clé de cache
 * @param data Données à mettre en cache
 */
export function saveToCache<T>(key: string, data: T): void {
  try {
    // Vérifier si le localStorage est disponible
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cacheData = {
      data,
      timestamp: Date.now()
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans le cache:', error);
  }
}

/**
 * Récupère des métadonnées OpenGraph, d'abord depuis le cache puis depuis l'API
 * @param url URL pour laquelle récupérer les métadonnées
 * @returns Promise contenant les métadonnées OpenGraph
 */
export async function getOGMetadata(url: string): Promise<OGMetadata> {
  // Normaliser l'URL pour le cache
  const normalizedUrl = url.trim().toLowerCase();
  const cacheKey = `og_${normalizedUrl}`;

  // Essayer de récupérer depuis le cache
  const cachedData = getFromCache<OGMetadata>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Récupérer depuis l'API
    const response = await fetch(`/api/og-metadata?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Sauvegarder dans le cache
    saveToCache(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    
    // En cas d'erreur, retourner des métadonnées par défaut
    const domain = new URL(url).hostname.replace('www.', '');
    const defaultData: OGMetadata = {
      title: `Contenu de ${domain}`,
      image: '',
      description: '',
      favicon: '',
      domain
    };
    
    return defaultData;
  }
}
