// expo-camera.d.ts
declare module 'expo-camera' {
    import { ComponentType } from 'react';
    import { ViewProps } from 'react-native';
  
    export interface CameraProps extends ViewProps {
      type?: number;
      flashMode?: number;
      autoFocus?: number;
      zoom?: number;
      whiteBalance?: number;
      onCameraReady?: () => void;
      onMountError?: (error: any) => void;
      onBarCodeScanned?: (data: { type: string, data: string }) => void;
    }
  
    export class Camera extends React.Component<CameraProps> {
      static requestPermissionsAsync(): { status: any; } | PromiseLike<{ status: any; }> {
        throw new Error("Method not implemented.");
      }
}
  
    export const requestCameraPermissionsAsync: () => Promise<{ status: string }>;
    export const CameraType: {
      back: number;
      front: number;
    };
    export const FlashMode: {
      on: number;
      off: number;
      auto: number;
    };
    export const AutoFocus: {
      on: number;
      off: number;
    };
    export const WhiteBalance: {
      auto: number;
      sunny: number;
      cloudy: number;
      shadow: number;
      incandescent: number;
      fluorescent: number;
    };
  }
  