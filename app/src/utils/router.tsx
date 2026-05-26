import { createContext, createElement, useContext, useEffect, useMemo, useRef, type ComponentType, type ReactNode } from 'react'
import { create } from 'zustand'

// ---------------------------------------------------------------------------
// Router store — zustand-backed in-memory routing for Electron
// ---------------------------------------------------------------------------

interface RouteParams extends Record<string, string> {}

interface RouterState {
  pathname: string
  params: RouteParams
  navigate: (to: string) => void
}

export const useRouterStore = create<RouterState>((set) => ({
  pathname: '/',
  params: {},
  navigate: (to: string) => set({ pathname: to }),
}))

/**
 * Navigate to a new path. Sets params to {} unless the caller
 * has already injected params via navigateWithParams.
 */
export function navigate(to: string) {
  useRouterStore.getState().navigate(to)
}

/**
 * Navigate and also set route params (for dynamic routes).
 */
export function navigateWithParams(to: string, params: RouteParams) {
  useRouterStore.setState({ pathname: to, params })
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Current pathname. */
export function useLocation() {
  return useRouterStore((s) => s.pathname)
}

/** Current route params (populated by dynamic route wrappers). */
export function useParams(): RouteParams {
  return useRouterStore((s) => s.params)
}

/**
 * Returns a `navigate` function (stable identity).
 * Drop-in for TanStack's `useNavigate()`.
 */
export function useNavigate() {
  return useRouterStore((s) => s.navigate)
}

// ---------------------------------------------------------------------------
// Link component — drop-in for TanStack's <Link>
// ---------------------------------------------------------------------------

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  params?: RouteParams
}

export function Link({ to, params, onClick, ...rest }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (params && Object.keys(params).length > 0) {
      navigateWithParams(to, params)
    } else {
      navigate(to)
    }
    onClick?.(e)
  }
  return <a href={to} onClick={handleClick} {...rest} />
}

// ---------------------------------------------------------------------------
// Outlet context — for nested route rendering
// ---------------------------------------------------------------------------

const OutletContext = createContext<ReactNode>(null)

export function OutletProvider({ children, outlet }: { children: ReactNode; outlet: ReactNode }) {
  return createElement(OutletContext.Provider, { value: outlet }, children)
}

export function Outlet() {
  return useContext(OutletContext)
}

// ---------------------------------------------------------------------------
// Route matching utilities
// ---------------------------------------------------------------------------

export interface RouteDefinition {
  path: string
  component: ComponentType
  children?: RouteDefinition[]
}

/**
 * Match a pathname against a route tree. Returns the matched component
 * stack and extracted params.
 */
export function matchRoutes(
  routes: RouteDefinition[],
  pathname: string,
): { components: ComponentType[]; params: RouteParams } | null {
  for (const route of routes) {
    const result = matchRoute(route, pathname, [])
    if (result) return result
  }
  return null
}

function matchRoute(
  route: RouteDefinition,
  pathname: string,
  parentComponents: ComponentType[],
): { components: ComponentType[]; params: RouteParams } | null {
  const { match, params, remaining } = matchSegment(route.path, pathname)

  if (!match) return null

  const components = [...parentComponents, route.component]

  // Exact match — no remaining path
  if (!remaining || remaining === '') {
    if (!route.children || route.children.length === 0) {
      return { components, params }
    }
    // There are children but no remaining path — try matching a child with path ""
    for (const child of route.children) {
      const childResult = matchRoute(child, '', components)
      if (childResult) return childResult
    }
    return { components, params }
  }

  // Try matching children with the remaining path
  if (route.children) {
    for (const child of route.children) {
      const childResult = matchRoute(child, remaining, components)
      if (childResult) return childResult
    }
  }

  return null
}

/**
 * Match a single route segment against the beginning of a pathname.
 * Returns whether it matched, any extracted params, and the remaining path.
 */
function matchSegment(
  routePath: string,
  pathname: string,
): { match: boolean; params: RouteParams; remaining: string } {
  const params: RouteParams = {}

  // Empty path always matches
  if (routePath === '') {
    return { match: true, params, remaining: pathname }
  }

  // Wildcard path matches everything
  if (routePath === '*') {
    return { match: true, params, remaining: '' }
  }

  const routeParts = routePath.split('/')
  const pathParts = pathname.split('/').filter(Boolean)

  // Skip leading empty from splitting "/"
  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i]
    if (routePart === '') continue

    const pathIndex = i - countEmpty(routeParts.slice(0, i))
    if (pathIndex >= pathParts.length) {
      return { match: false, params: {}, remaining: '' }
    }

    if (routePart.startsWith('$')) {
      // Dynamic segment
      const paramName = routePart.slice(1)
      params[paramName] = pathParts[pathIndex]
    } else if (routePart !== pathParts[pathIndex]) {
      return { match: false, params: {}, remaining: '' }
    }
  }

  // Calculate remaining path
  const consumedSegments = routeParts.filter((p) => p !== '').length
  const remainingParts = pathParts.slice(consumedSegments)
  const remaining = remainingParts.length > 0 ? '/' + remainingParts.join('/') : ''

  return { match: true, params, remaining }
}

function countEmpty(parts: string[]): number {
  let count = 0
  for (const p of parts) {
    if (p === '') count++
  }
  return count
}

// ---------------------------------------------------------------------------
// Router component — renders the matched route hierarchy
// ---------------------------------------------------------------------------

export interface RouterProps {
  routes: RouteDefinition[]
  guards?: Array<{
    check: (pathname: string) => string | null // returns redirect path or null
  }>
}

export function Router({ routes, guards }: RouterProps) {
  const pathname = useRouterStore((s) => s.pathname)
  const initialGuardCheck = useRef(false)

  // Run guards on pathname change
  useEffect(() => {
    if (!guards) return
    for (const guard of guards) {
      const redirectPath = guard.check(pathname)
      if (redirectPath) {
        navigate(redirectPath)
        return
      }
    }
  }, [pathname, guards])

  const result = useMemo(() => matchRoutes(routes, pathname), [routes, pathname])

  if (!result || result.components.length === 0) {
    // No match — redirect to /
    return null
  }

  // Render component stack: root wraps dashboard wraps page, etc.
  // We render from inside out, with the last component getting no outlet.
  const { components, params } = result

  // Inject params into the store so useParams() works
  useRouterStore.setState({ params })

  // Build nested elements — last component is the leaf, each parent wraps the next
  let element: ReactNode = null
  for (let i = components.length - 1; i >= 0; i--) {
    const Component = components[i]
    if (i === components.length - 1) {
      element = createElement(Component)
    } else {
      element = createElement(OutletProvider, { outlet: element, children: createElement(Component) })
    }
  }

  return element
}
