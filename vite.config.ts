import tailwindcss from '@tailwindcss/vite';
import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	// `vite build --mode app`: static SPA for the Capacitor phone app (reads .env.app)
	const app = mode === 'app';

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				// Node server for the Docker image (see Dockerfile); output lands in build/.
				adapter: app ? adapterStatic({ fallback: 'index.html' }) : adapterNode(),
				// Capacitor serves the files itself; push in the app goes through the native plugin.
				...(app ? { serviceWorker: { register: false } } : {})
			})
		]
	};
});
