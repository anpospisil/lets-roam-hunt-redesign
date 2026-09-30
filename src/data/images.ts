// Maps the file names used in hunt data to bundled images (React Native needs static requires).
import type { ImageSourcePropType } from 'react-native';

const images: Record<string, ImageSourcePropType> = {
  'team.jpg': require('../../assets/images/team.jpg'),
  'library.jpg': require('../../assets/images/library.jpg'),
};

/** Foxtrot mascot clipart from the design system (assets/mascots). */
export const mascots = {
  camera: require('../../assets/images/mascot-camera.png'),
  celebrating: require('../../assets/images/mascot-celebrating.png'),
  waving: require('../../assets/images/mascot-waving.png'),
};

export function imageFor(name: string | undefined): ImageSourcePropType | null {
  return name ? images[name] ?? null : null;
}
