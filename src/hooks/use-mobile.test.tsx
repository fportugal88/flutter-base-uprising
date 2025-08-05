import { renderHook, act, cleanup } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { useIsMobile } from "./use-mobile"

const MOBILE_BREAKPOINT = 768

describe("useIsMobile", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  test("returns true below breakpoint and false above", () => {
    const listeners: Array<() => void> = []

    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: window.innerWidth < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addEventListener: (_event, handler) => {
        listeners.push(handler)
      },
      removeEventListener: (_event, handler) => {
        const index = listeners.indexOf(handler)
        if (index !== -1) listeners.splice(index, 1)
      },
      dispatchEvent: () => false,
    }))

    ;(window as any).innerWidth = 500
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => {
      ;(window as any).innerWidth = 1024
      listeners.forEach((fn) => fn())
    })

    expect(result.current).toBe(false)
  })
})
