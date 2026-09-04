import type { ReactElement } from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ToastStack } from '../toast/ToastStack/ToastStack'
import styles from './__root.module.css'

function RootLayout(): ReactElement {
  return (
    <>
      <header className="pico container">
        <section>
          <article>
            <h1>
              <Link to="/">NOEMA System</Link>
              {!!REVISION_LABEL && <sub className={styles.revision}>{REVISION_LABEL}</sub>}
            </h1>
            <p>나만의 말뭉치를 만들자!</p>
            <nav>
              <ul>
                <li>
                  <Link to="/explore">탐색</Link>
                </li>
                <li>
                  <Link to="/relation/new">알려주기</Link>
                </li>
                <li>
                  <Link to="/relations">관계</Link>
                </li>
                <li>
                  <Link to="/diary">다이어리</Link>
                </li>
                <li>
                  <Link to="/tools">도구</Link>
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
      <ToastStack />
      <TanStackRouterDevtools />
    </>
  )
}

function getRevisionLabel(): string {
  if (!import.meta.env.VITE_REVISION_COUNT || !import.meta.env.VITE_COMMIT_HASH) {
    return ''
  }
  return `r${import.meta.env.VITE_REVISION_COUNT}: ${import.meta.env.VITE_COMMIT_HASH}`
}

const REVISION_LABEL = getRevisionLabel()

export const Route = createRootRoute({ component: RootLayout })
