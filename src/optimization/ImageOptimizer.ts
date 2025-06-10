
export interface OptimizationSettings {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
}

export class ImageOptimizer {
  static async compressImage(
    file: File, 
    settings: OptimizationSettings = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      format: 'webp'
    }
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const ratio = Math.min(settings.maxWidth / width, settings.maxHeight / height);
        
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: `image/${settings.format}`,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          `image/${settings.format}`,
          settings.quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static async generateThumbnail(file: File, size: number = 150): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Center crop
        const aspectRatio = img.width / img.height;
        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

        if (aspectRatio > 1) {
          sourceWidth = img.height;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          sourceHeight = img.width;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx?.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
        resolve(canvas.toDataURL('image/webp', 0.8));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
