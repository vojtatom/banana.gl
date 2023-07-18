import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'bananagl/bananagl.ts'),
            name: 'bananagl',
            fileName: 'bananagl',
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['react', 'react-dom'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    react: 'React',
                    //what about react-dom?
                },
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@bananagl': resolve(__dirname, './bananagl'),
        },
    },
});
