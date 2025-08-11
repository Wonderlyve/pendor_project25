interface PreloadQueueItem {
  url: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

export class VideoPreloader {
  private static instance: VideoPreloader;
  private preloadQueue: PreloadQueueItem[] = [];
  private preloadedVideos = new Map<string, HTMLVideoElement>();
  private isProcessing = false;
  private maxCacheSize = 10; // Maximum de vidéos en cache

  static getInstance(): VideoPreloader {
    if (!VideoPreloader.instance) {
      VideoPreloader.instance = new VideoPreloader();
    }
    return VideoPreloader.instance;
  }

  // Ajouter une vidéo à la file de préchargement
  preloadVideo(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    // Éviter les doublons
    if (this.preloadQueue.find(item => item.url === url) || this.preloadedVideos.has(url)) {
      return;
    }

    this.preloadQueue.push({
      url,
      priority,
      timestamp: Date.now()
    });

    // Trier par priorité (high > medium > low)
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.processQueue();
  }

  // Précharger plusieurs vidéos (pour anticiper la navigation)
  preloadVideosBatch(urls: string[], priority: 'high' | 'medium' | 'low' = 'low'): void {
    urls.forEach(url => this.preloadVideo(url, priority));
  }

  // Obtenir une vidéo préchargée
  getPreloadedVideo(url: string): HTMLVideoElement | null {
    return this.preloadedVideos.get(url) || null;
  }

  // Traiter la file de préchargement
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!;
      
      try {
        await this.loadVideo(item.url);
        console.log(`✅ Vidéo préchargée: ${item.url}`);
      } catch (error) {
        console.warn(`❌ Échec du préchargement: ${item.url}`, error);
      }

      // Gérer la taille du cache
      this.manageCacheSize();
      
      // Pause entre les chargements pour ne pas surcharger
      await this.delay(100);
    }

    this.isProcessing = false;
  }

  // Charger une vidéo en mémoire
  private loadVideo(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true; // Nécessaire pour certains navigateurs
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);

      video.oncanplaythrough = () => {
        clearTimeout(timeoutId);
        this.preloadedVideos.set(url, video);
        resolve();
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Erreur de chargement'));
      };

      video.src = url;
    });
  }

  // Gérer la taille du cache
  private manageCacheSize(): void {
    if (this.preloadedVideos.size <= this.maxCacheSize) {
      return;
    }

    // Convertir en array et trier par usage (les plus anciens d'abord)
    const entries = Array.from(this.preloadedVideos.entries());
    
    // Supprimer les plus anciens
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([url, video]) => {
      video.src = '';
      video.remove();
      this.preloadedVideos.delete(url);
    });
  }

  // Nettoyer le cache
  clearCache(): void {
    this.preloadedVideos.forEach(video => {
      video.src = '';
      video.remove();
    });
    this.preloadedVideos.clear();
    this.preloadQueue = [];
  }

  // Précharger les vidéos visibles dans le viewport bientôt
  preloadNearbyVideos(currentIndex: number, videoUrls: string[]): void {
    // Précharger les 3 suivantes et 1 précédente
    const range = {
      start: Math.max(0, currentIndex - 1),
      end: Math.min(videoUrls.length - 1, currentIndex + 3)
    };

    for (let i = range.start; i <= range.end; i++) {
      if (i !== currentIndex && videoUrls[i]) {
        const priority = Math.abs(i - currentIndex) === 1 ? 'high' : 'medium';
        this.preloadVideo(videoUrls[i], priority);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instance singleton
export const videoPreloader = VideoPreloader.getInstance();