import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MushBot/1.0; +https://daily-mush.vercel.app/)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const html = await response.text();
    const root = parse(html);
    
    // Extraire les métadonnées OpenGraph
    const title = root.querySelector('meta[property="og:title"]')?.getAttribute('content') || 
                  root.querySelector('title')?.text || 
                  new URL(url).hostname.replace('www.', '');
                  
    const image = root.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                  root.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || 
                  '';
                  
    const description = root.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                        root.querySelector('meta[name="description"]')?.getAttribute('content') || 
                        '';
    
    // Extraire le favicon
    const favicon = root.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                    root.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                    `/favicon.ico`;
    
    // Construire l'URL complète du favicon si c'est un chemin relatif
    const faviconUrl = favicon.startsWith('http') 
      ? favicon 
      : new URL(favicon.startsWith('/') ? favicon : `/${favicon}`, url).toString();
    
    return NextResponse.json({ 
      title, 
      image, 
      description,
      favicon: faviconUrl,
      domain: new URL(url).hostname.replace('www.', '')
    });
  } catch (error) {
    console.error('Erreur lors de l\'extraction des métadonnées:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'extraction des métadonnées',
      title: new URL(url).hostname.replace('www.', ''),
      image: '',
      description: '',
      favicon: '',
      domain: new URL(url).hostname.replace('www.', '')
    }, { status: 200 }); // Retourner 200 même en cas d'erreur pour éviter de casser l'UI
  }
}
