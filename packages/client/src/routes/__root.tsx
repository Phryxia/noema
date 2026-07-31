import type { ReactElement } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

function RootLayout(): ReactElement {
  return (
    <>
      <header className="pico container">
        <section>
          <article>
            <h1>
              <Link to="/">NOEMA System</Link>
            </h1>
            <p>나만의 말뭉치를 만들자!</p>
            <nav>
              <ul>
                <li>
                  <Link to="/explore">탐색</Link>
                </li>
                <li>
                  <Link to="/qna">문답</Link>
                </li>
                <li>
                  <Link to="/lab/embedding">실험</Link>
                </li>
                <li>
                  <Link to="/settings">설정</Link>
                </li>
              </ul>
            </nav>
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
