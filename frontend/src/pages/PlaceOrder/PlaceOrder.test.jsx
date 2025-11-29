import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PlaceOrder from './PlaceOrder'
import { StoreContext } from '../../components/context/StoreContext'
const toastErrorMock = vi.fn()
const toastSuccessMock = vi.fn()

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock('react-toastify', () => ({
  toast: {
    error: (...args) => toastErrorMock(...args),
    success: (...args) => toastSuccessMock(...args)
  }
}))

vi.mock('@react-google-maps/api', () => ({
  LoadScript: ({ children }) => <div data-testid='load-script'>{children}</div>,
  GoogleMap: ({ children }) => <div data-testid='google-map'>{children}</div>,
  Marker: () => <div data-testid='map-marker' />
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const originalFetch = global.fetch

const mockAdministrativeApis = () => {
  const provincesPayload = [
    {
      code: 79,
      name: 'Hồ Chí Minh',
      districts: [
        {
          code: 760,
          name: 'District 1'
        }
      ]
    }
  ]
  const wardsPayload = {
    wards: [
      { code: 1, name: 'Bến Nghé' }
    ]
  }

  global.fetch = vi.fn((url) => {
    if (url.includes('api/?depth=2')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(provincesPayload) })
    }
    if (url.includes('api/d/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(wardsPayload) })
    }
    if (url.includes('vapi.vnappmob.com')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ results: wardsPayload.wards }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  })
}

const renderWithContext = (contextValue) => {
  return render(
    <StoreContext.Provider value={contextValue}>
      <PlaceOrder />
    </StoreContext.Provider>
  )
}

const fillRequiredFields = () => {
  fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } })
  fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } })
  fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('Street, house number'), { target: { value: '123 Main St' } })
  fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '0987654321' } })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAdministrativeApis()
})

afterAll(() => {
  global.fetch = originalFetch
})

describe('PlaceOrder multi-tenant safeguards', () => {
  it('shows toast when cart references unknown menu items', async () => {
    renderWithContext({
      getTotalCartAmount: () => 15,
      token: 'test-token',
      cartItems: { ghost: 1 },
      url: 'http://localhost:4000',
      allFoodsMap: {}
    })

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    fillRequiredFields()

    fireEvent.click(screen.getByText('PROCEED TO PAYMENT'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(expect.stringContaining('could not be found'))
    })
  })

  it('requires confirmed delivery pin before submitting payment', async () => {
    const knownFood = {
      _id: 'food-1',
      name: 'Pho',
      price: 8,
      res_id: 'restaurant-1',
      image: 'pho.jpg'
    }

    renderWithContext({
      getTotalCartAmount: () => 16,
      token: 'test-token',
      cartItems: { 'food-1': 2 },
      url: 'http://localhost:4000',
      allFoodsMap: { 'food-1': knownFood }
    })

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    fillRequiredFields()

    fireEvent.click(screen.getByText('PROCEED TO PAYMENT'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(expect.stringContaining('confirm the delivery location'))
    })
  })
})
