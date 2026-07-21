import './env'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { hello } from '@rayelxia/shared' // if you build to js, you must change this by relative path

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: `http://localhost:${process.env.CLIENT_PORT}`,
})

fastify.get('/', (req, res) => {
  res.send({ hello: 'world' })
})

fastify.listen({ port: Number(process.env.VITE_SERVER_PORT) })

console.log(hello())
