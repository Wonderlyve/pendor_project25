
export interface VideoOptimizationSettings {
  maxSize: number; // in MB
  maxDuration: number; // in seconds
  quality: 'low' | 'medium' | 'high';
}

export class VideoOptimizer {
  static async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size / (1024 * 1024) // MB
        });
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  static async generateVideoThumbnail(file: File, timeOffset: number = 1): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = 300;
        canvas.height = (video.videoHeight / video.videoWidth) * 300;
        video.currentTime = Math.min(timeOffset, video.duration / 2);
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        }
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  static validateVideo(file: File, settings: VideoOptimizationSettings): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const info = await this.getVideoInfo(file);
        
        const isValidSize = info.size <= settings.maxSize;
        const isValidDuration = info.duration <= settings.maxDuration;
        
        resolve(isValidSize && isValidDuration);
      } catch {
        resolve(false);
      }
    });
  }

  static async optimizeVideo(file: File, settings: VideoOptimizationSettings): Promise<File> {
    // Pour une optimisation vidéo complète, nous aurions besoin d'une bibliothèque comme FFmpeg.wasm
    // Pour l'instant, nous retournons le fichier original s'il respecte les critères
    const isValid = await this.validateVideo(file, settings);
    
    if (isValid) {
      return file;
    }
    
    // En cas de fichier non valide, on peut implémenter une compression basique
    // ou rejeter le fichier selon les besoins
    throw new Error('Video file does not meet optimization criteria');
  }
}
