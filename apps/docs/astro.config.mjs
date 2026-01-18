// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'LocalFlag',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/localflag/localflag' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'DevTools', slug: 'guides/devtools' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'Provider', slug: 'reference/provider' },
						{ label: 'Hooks', slug: 'reference/hooks' },
						{ label: 'Components', slug: 'reference/components' },
					],
				},
			],
		}),
	],
});
