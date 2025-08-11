interface PrefetchRule {
  condition: () => boolean;
  videos: string[];
  priority: 'high' | 'medium' | 'low';
}

export class VideoPrefetcher {
  private static instance: VideoPrefetcher;
  private prefetchRules: PrefetchRule[] = [];
  private prefetchedUrls = new Set<string>();
  private observerActive = false;

  static getInstance(): VideoPrefetcher {
    if (!VideoPrefetcher.instance) {
      VideoPrefetcher.instance = new VideoPrefetcher();
    }
    return VideoPrefetcher.instance;
  }

  // Ajouter une règle de prefetch
  addPrefetchRule(rule: PrefetchRule): void {
    this.prefetchRules.push(rule);
  }

  // Prefetch intelligent basé sur le comportement utilisateur
  setupIntelligentPrefetch(): void {
    if (this.observerActive) return;

    this.observerActive = true;

    // Observer les interactions utilisateur
    this.setupUserInteractionObserver();
    this.setupScrollObserver();
    this.setupRouteChangeObserver();
  }

  // Observer les interactions utilisateur (hover, focus)
  private setupUserInteractionObserver(): void {
    // Prefetch quand l'utilisateur survole un lien vers des vidéos
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const videoLink = target.closest('[data-prefetch-videos]');
      
      if (videoLink) {
        const videos = videoLink.getAttribute('data-prefetch-videos');
        if (videos) {
          const videoUrls = JSON.parse(videos);
          this.prefetchVideos(videoUrls, 'high');
        }
      }
    });

    // Prefetch basé sur le focus (navigation clavier)
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const videoLink = target.closest('[data-prefetch-videos]');
      
      if (videoLink) {
        const videos = videoLink.getAttribute('data-prefetch-videos');
        if (videos) {
          const videoUrls = JSON.parse(videos);
          this.prefetchVideos(videoUrls, 'medium');
        }
      }
    });
  }

  // Observer le scroll pour anticiper le contenu
  private setupScrollObserver(): void {
    let lastScrollTop = 0;
    let scrollDirection: 'up' | 'down' = 'down';

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
      lastScrollTop = scrollTop;

      // Prefetch basé sur la direction du scroll
      this.handleScrollBasedPrefetch(scrollDirection);
    }, { passive: true });
  }

  // Observer les changements de route
  private setupRouteChangeObserver(): void {
    // Pour React Router
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // Observer les clics sur les liens de navigation
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        this.handleLinkClick(link.href);
      }
    });
  }

  // Gestion du prefetch basé sur le scroll
  private handleScrollBasedPrefetch(direction: 'up' | 'down'): void {
    // Logique pour précharger le contenu dans la direction du scroll
    const videoElements = document.querySelectorAll('video[data-src]');
    
    videoElements.forEach((video) => {
      const rect = video.getBoundingClientRect();
      const isNearViewport = direction === 'down' 
        ? rect.top < window.innerHeight + 500 // 500px avant d'entrer
        : rect.bottom > -500; // 500px après être sorti

      if (isNearViewport) {
        const src = video.getAttribute('data-src');
        if (src && !this.prefetchedUrls.has(src)) {
          this.prefetchVideo(src, 'medium');
        }
      }
    });
  }

  // Gestion du changement de route
  private handleRouteChange(): void {
    // Appliquer les règles de prefetch pour la nouvelle route
    this.prefetchRules.forEach(rule => {
      if (rule.condition()) {
        this.prefetchVideos(rule.videos, rule.priority);
      }
    });
  }

  // Gestion du clic sur lien
  private handleLinkClick(href: string): void {
    // Prefetch anticipé basé sur la destination
    if (href.includes('/brief') || href.includes('/video')) {
      // Règles spécifiques pour les pages vidéo
      this.anticipateVideoPageContent(href);
    }
  }

  // Anticiper le contenu d'une page vidéo
  private anticipateVideoPageContent(href: string): void {
    // Logique pour deviner quelles vidéos pourraient être nécessaires
    // Basé sur l'URL de destination
    console.log('🔮 Anticipation du contenu vidéo pour:', href);
  }

  // Prefetch d'une seule vidéo
  private prefetchVideo(url: string, priority: 'high' | 'medium' | 'low'): void {
    if (this.prefetchedUrls.has(url)) return;

    this.prefetchedUrls.add(url);

    // Utiliser fetch avec cache pour prefetch
    fetch(url, {
      mode: 'cors',
      cache: 'force-cache'
    }).then(() => {
      console.log(`⚡ Vidéo prefetchée: ${url} (priorité: ${priority})`);
    }).catch((error) => {
      console.warn('Échec du prefetch:', url, error);
      this.prefetchedUrls.delete(url);
    });
  }

  // Prefetch de plusieurs vidéos
  private prefetchVideos(urls: string[], priority: 'high' | 'medium' | 'low'): void {
    urls.forEach(url => this.prefetchVideo(url, priority));
  }

  // Configuration pour différents types de pages
  setupPageSpecificRules(): void {
    // Règle pour la page d'accueil
    this.addPrefetchRule({
      condition: () => window.location.pathname === '/',
      videos: [], // À remplir avec les vidéos populaires
      priority: 'low'
    });

    // Règle pour les pages de briefing
    this.addPrefetchRule({
      condition: () => window.location.pathname.includes('/brief'),
      videos: [], // À remplir avec les vidéos de briefing récentes
      priority: 'high'
    });

    // Règle pour les pages de prédictions
    this.addPrefetchRule({
      condition: () => window.location.pathname.includes('/prediction'),
      videos: [], // À remplir avec les vidéos de prédictions populaires
      priority: 'medium'
    });
  }

  // Nettoyer les prefetch
  cleanup(): void {
    this.prefetchedUrls.clear();
    this.prefetchRules = [];
    this.observerActive = false;
  }
}

// Instance singleton
export const videoPrefetcher = VideoPrefetcher.getInstance();