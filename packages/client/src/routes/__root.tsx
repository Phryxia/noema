import type { ReactElement } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

function RootLayout(): ReactElement {
  return (
    <>
      <header className="pico container">
        <h1>Hello World!</h1>
      </header>
      <main className="pico container">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({ component: RootLayout })
