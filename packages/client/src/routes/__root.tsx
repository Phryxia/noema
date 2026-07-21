import type { ReactElement } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

function RootLayout(): ReactElement {
  return (
    <>
      <header className="pico container">
        <section>
          <article>
            <h1>NOEMA System</h1>
            <p>나만의 말뭉치를 만들자!</p>
          </article>
        </section>
      </header>
      <main className="pico container">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({ component: RootLayout })
