import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'bananagl/bananagl.ts'),
            name: 'bananagl',
            fileName: 'bananagl',
        },
    },
    resolve: {
        alias: {
            '@bananagl': resolve(__dirname, './bananagl'),
        },
    },
});
