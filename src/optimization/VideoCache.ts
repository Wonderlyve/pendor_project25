interface CachedVideo {
  blob: Blob;
  url: string;
  timestamp: number;
  size: number;
  metadata?: {
    duration: number;
    width: number;
    height: number;
  };
}

export class VideoCache {
  private static instance: VideoCache;
  private cache = new Map<string, CachedVideo>();
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  static getInstance(): VideoCache {
    if (!VideoCache.instance) {
      VideoCache.instance = new VideoCache();
    }
    return VideoCache.instance;
  }

  // Ajouter une vidéo au cache
  async cacheVideo(url: string): Promise<string | null> {
    try {
      // Vérifier si déjà en cache
      const cached = this.cache.get(url);
      if (cached) {
        // Mettre à jour le timestamp
        cached.timestamp = Date.now();
        return cached.url;
      }

      // Télécharger la vidéo
      const response = await fetch(url);
      if (!response.ok) throw new Error('Échec du téléchargement');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const videoData: CachedVideo = {
        blob,
        url: blobUrl,
        timestamp: Date.now(),
        size: blob.size
      };

      // Vérifier la taille du cache
      if (this.currentCacheSize + blob.size > this.maxCacheSize) {
        this.evictOldEntries(blob.size);
      }

      this.cache.set(url, videoData);
      this.currentCacheSize += blob.size;

      console.log(`📹 Vidéo mise en cache: ${url} (${this.formatSize(blob.size)})`);
      return blobUrl;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      return null;
    }
  }

  // Obtenir une vidéo du cache
  getCachedVideo(url: string): string | null {
    const cached = this.cache.get(url);
    if (cached) {
      // Mettre à jour le timestamp d'accès
      cached.timestamp = Date.now();
      return cached.url;
    }
    return null;
  }

  // Précharger plusieurs vidéos
  async preloadVideos(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.cacheVideo(url));
    await Promise.allSettled(promises);
  }

  // Éviction des anciennes entrées
  private evictOldEntries(neededSpace: number): void {
    // Trier par timestamp (plus ancien en premier)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    let freedSpace = 0;
    for (const [url, data] of entries) {
      URL.revokeObjectURL(data.url);
      this.cache.delete(url);
      this.currentCacheSize -= data.size;
      freedSpace += data.size;

      console.log(`🗑️ Vidéo évincée du cache: ${url}`);

      if (freedSpace >= neededSpace) {
        break;
      }
    }
  }

  // Nettoyer le cache
  clearCache(): void {
    this.cache.forEach(data => {
      URL.revokeObjectURL(data.url);
    });
    this.cache.clear();
    this.currentCacheSize = 0;
    console.log('🧹 Cache vidéo nettoyé');
  }

  // Statistiques du cache
  getCacheStats(): { size: string; entries: number; maxSize: string } {
    return {
      size: this.formatSize(this.currentCacheSize),
      entries: this.cache.size,
      maxSize: this.formatSize(this.maxCacheSize)
    };
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Instance singleton
export const videoCache = VideoCache.getInstance();