import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Phone app. It loads the deployed site, so every deploy reaches the app without a new APK;
 * only changes to the native code (android/, ios/) need a new install.
 * shortcut: no offline start, the app needs the server; the bundled SPA from
 * `npm run build:app` (webDir) is the way back if that ever matters.
 */
const config: CapacitorConfig = {
	appId: 'de.muv1n.klar',
	appName: 'Klar',
	webDir: 'build',
	server: { url: 'https://app.muv1n.de' }
};

export default config;
