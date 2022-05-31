import * as esbuild from 'esbuild-wasm'
import React, { useEffect, useState, useRef } from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'

const App = () => {
  const ref = useRef<any>()
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')

  // esbuild V0.9.0 'startService' is replaced with 'initialize'
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm',
    })
  }

  useEffect(() => {
    startService()
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }

  const handleClick = async () => {
    if (!ref.current) {
      return
    }

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin()],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    })

    setCode(result.outputFiles[0].text)
  }

  return (
    <div>
      <textarea name='' id='' value={input} onChange={handleChange}></textarea>
      <div>
        <button onClick={handleClick}>Submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  )
}

export default App
