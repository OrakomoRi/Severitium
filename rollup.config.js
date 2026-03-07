import { glob } from 'glob';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION = process.env.VERSION || '0.0.0-dev';

function globImport() {
	return {
		name: 'glob-import',
		resolveId(id, importer) {
			if (id.includes('*')) {
				return { id, external: false };
			}
		},
		load(id) {
			if (!id.includes('*')) return;

			const pattern = id.startsWith('./')
				? path.join(__dirname, 'src', id.slice(2))
				: id;

			const files = glob.sync(pattern, { windowsPathsNoEscape: true }).filter(f => f.endsWith('.js'));

			const imports = files.map(f => {
				const absolutePath = path.resolve(f);
				return `import '${absolutePath.replace(/\\/g, '/')}';`;
			});

			return imports.join('\n');
		}
	};
}

const sharedPlugins = [
	replace({
		preventAssignment: true,
		delimiters: ['', ''],
		values: {
			'__VERSION__': VERSION,
		},
	}),
	globImport(),
	terser({ format: { comments: false } }),
];

const loaderConfig = {
	input: 'src/loader.js',
	output: {
		file: 'dist/loader.min.js',
		format: 'iife',
		name: 'SeveritiumLoader',
	},
	plugins: sharedPlugins,
};

const modulesConfig = {
	input: 'src/modules.js',
	output: {
		file: 'dist/script.release.min.js',
		format: 'iife',
		name: 'SeveritiumModules',
	},
	plugins: sharedPlugins,
};

export default [loaderConfig, modulesConfig];
