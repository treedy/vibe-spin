export interface AppVersionMetadata {
  appVersion: string;
  exportVersion: number;
}

export const APP_VERSION_METADATA: AppVersionMetadata = {
  appVersion: __APP_VERSION__,
  exportVersion: 1,
};
