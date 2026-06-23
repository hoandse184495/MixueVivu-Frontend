import { Image, ImageContentFit } from 'expo-image';
import { ImageStyle, StyleProp, Text, View } from 'react-native';

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

type TourImageProps = {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  fallbackIconSize?: number;
};

export function TourImage({
  uri,
  style,
  contentFit = 'cover',
  fallbackIconSize = 36,
}: TourImageProps) {
  if (!uri) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: '#e8f0fe',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: fallbackIconSize }}>🏔️</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      placeholder={{ blurhash: BLURHASH }}
      placeholderContentFit={contentFit}
      cachePolicy="memory-disk"
      transition={180}
    />
  );
}

export function prefetchTourImages(urls: Array<string | null | undefined>) {
  const validUrls = Array.from(new Set(urls.filter(Boolean))) as string[];
  if (validUrls.length === 0) return;

  Image.prefetch(validUrls, 'memory-disk').catch(() => {
    // Prefetch is a performance hint only; image rendering should continue normally.
  });
}
