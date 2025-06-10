
import OptimizedFileUpload from '@/optimization/OptimizedFileUpload';

interface FileUploadProps {
  onImageSelect: (file: File | null) => void;
  onVideoSelect: (file: File | null) => void;
  selectedImage: File | null;
  selectedVideo: File | null;
}

const FileUpload = ({ onImageSelect, onVideoSelect, selectedImage, selectedVideo }: FileUploadProps) => {
  return (
    <OptimizedFileUpload 
      onImageSelect={onImageSelect}
      onVideoSelect={onVideoSelect}
      selectedImage={selectedImage}
      selectedVideo={selectedVideo}
    />
  );
};

export default FileUpload;
