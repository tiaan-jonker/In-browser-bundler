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

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(
              args.path,
              'https://unpkg.com' + args.resolveDir + '/'
            ).href,
          }
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        }
      })

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        // if there's an attempt to load index.js then don't
        if (args.path === 'index.js') {
          // rather return the below
          return {
            loader: 'jsx',
            contents: `
              const message = require('nested-test-pkg');
              console.log(message);
            `,
          }
        }

        const { data, request } = await axios.get(args.path)
        console.log(request)
        return {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        }
      })
    },
  }
}
