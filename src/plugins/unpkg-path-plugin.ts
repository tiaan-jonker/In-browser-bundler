import * as esbuild from 'esbuild-wasm'
import axios from 'axios'

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // below hijacks edbuild's natural process of trying to find out
      // where the file is stored
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args)
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        } 
        // else if (args.path === 'tiny-test-pkg') {
        //   return {
        //     path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
        //     namespace: 'a',
        //   }
        // }
      })

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        // if there's an attempt to load index.js then don't
        if (args.path === 'index.js') {
          // rather return the below
          return {
            loader: 'jsx',
            contents: `
              const message = require('tiny-test-pkg');
              console.log(message);
            `,
          }
        }

        const { data } = await axios.get(args.path)
        return {
          loader: 'jsx',
          contents: data,
        }
      })
    },
  }
}
