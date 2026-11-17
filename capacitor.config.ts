import type { CapacitorConfig } from '@capacitor/cli';

/** Phone app: wraps the static SPA from `npm run build:app` (see vite.config.ts). */
const config: CapacitorConfig = {
	appId: 'de.muv1n.klar',
	appName: 'Klar',
	webDir: 'build'
};

export default config;
