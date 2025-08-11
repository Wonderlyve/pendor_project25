interface VideoControlManagerState {
  activeVideoId: string | null;
  videoElements: Map<string, HTMLVideoElement>;
}

class VideoControlManager {
  private static instance: VideoControlManager;
  private state: VideoControlManagerState = {
    activeVideoId: null,
    videoElements: new Map()
  };

  static getInstance(): VideoControlManager {
    if (!VideoControlManager.instance) {
      VideoControlManager.instance = new VideoControlManager();
    }
    return VideoControlManager.instance;
  }

  // Enregistrer une vidéo
  registerVideo(id: string, videoElement: HTMLVideoElement): void {
    this.state.videoElements.set(id, videoElement);
  }

  // Désenregistrer une vidéo
  unregisterVideo(id: string): void {
    this.state.videoElements.delete(id);
    if (this.state.activeVideoId === id) {
      this.state.activeVideoId = null;
    }
  }

  // Jouer une vidéo et mettre en pause toutes les autres
  async playVideo(id: string): Promise<void> {
    const videoElement = this.state.videoElements.get(id);
    if (!videoElement) return;

    // Mettre en pause toutes les autres vidéos
    await this.pauseAllExcept(id);

    // Marquer cette vidéo comme active
    this.state.activeVideoId = id;

    // Jouer la vidéo active
    try {
      await videoElement.play();
      console.log(`▶️ Vidéo active: ${id}`);
    } catch (error) {
      console.warn(`❌ Échec lecture vidéo ${id}:`, error);
    }
  }

  // Mettre en pause toutes les vidéos sauf une
  private async pauseAllExcept(excludeId: string): Promise<void> {
    const pausePromises: Promise<void>[] = [];

    this.state.videoElements.forEach((videoElement, id) => {
      if (id !== excludeId && !videoElement.paused) {
        pausePromises.push(
          new Promise<void>((resolve) => {
            videoElement.pause();
            console.log(`⏸️ Vidéo mise en pause: ${id}`);
            resolve();
          })
        );
      }
    });

    await Promise.all(pausePromises);
  }

  // Mettre en pause toutes les vidéos
  async pauseAll(): Promise<void> {
    await this.pauseAllExcept('');
    this.state.activeVideoId = null;
  }

  // Obtenir l'ID de la vidéo active
  getActiveVideoId(): string | null {
    return this.state.activeVideoId;
  }

  // Vérifier si une vidéo est active
  isVideoActive(id: string): boolean {
    return this.state.activeVideoId === id;
  }

  // Nettoyer toutes les vidéos
  cleanup(): void {
    this.state.videoElements.clear();
    this.state.activeVideoId = null;
  }

  // Obtenir les statistiques
  getStats(): { total: number; active: string | null } {
    return {
      total: this.state.videoElements.size,
      active: this.state.activeVideoId
    };
  }
}

// Instance singleton
export const videoControlManager = VideoControlManager.getInstance();