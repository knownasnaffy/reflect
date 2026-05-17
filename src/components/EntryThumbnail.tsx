import { useEffect, useState } from "react";

interface EntryThumbnailProps {
  imageUrl: string;
  imageBlob?: Blob;
  alt: string;
  className?: string;
}

export function EntryThumbnail({ imageUrl, imageBlob, alt, className }: EntryThumbnailProps) {
  const [displayUrl, setDisplayUrl] = useState(imageUrl);

  useEffect(() => {
    let url = imageUrl;
    if (imageBlob) {
      url = URL.createObjectURL(imageBlob);
      setDisplayUrl(url);
    } else {
      setDisplayUrl(imageUrl);
    }

    return () => {
      if (imageBlob && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrl, imageBlob]);

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
