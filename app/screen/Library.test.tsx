import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Library } from './Library'
import { AssetList } from '../models/assets'
import { renderWithStore } from '../store/test-utils'
import { makeStore } from '../store/store'
import { toggleFavourite } from '../store/favouritesSlice'

jest.mock('../analytics', () => ({
  analyticsInit: jest.fn(),
  analyticsLogEvent: jest.fn(),
}))

jest.mock('../components/Modal', () => ({
  Modal: () => null,
}))

jest.mock('../utils/requests', () => ({
  getAssetDetails: jest.fn().mockResolvedValue({
    id: 1,
    name: 'KPI Alpha',
    description_short: 'short',
    description: 'long',
    asset_type: 'KPI',
    tags: [],
  }),
  fetchMetricData: jest.fn().mockResolvedValue({ metricData: { data: [] } }),
}))

const assets: AssetList[] = [
  {
    id: 1,
    name: 'KPI Alpha',
    description: 'Revenue dashboard',
    date: '01/01/2004',
    asset_type: 'KPI',
    likes: 10,
    featured: true,
  },
  {
    id: 2,
    name: 'Layout Beta',
    description: 'Page template',
    date: '01/01/2004',
    asset_type: 'Layouts',
    likes: 5,
    featured: false,
  },
  {
    id: 3,
    name: 'Storyboard Gamma',
    description: 'Campaign frames',
    date: '01/01/2004',
    asset_type: 'Storyboards',
    likes: 20,
    featured: true,
  },
]

describe('Library', () => {
  test('renders featured assets on the default tab', async () => {
    renderWithStore(<Library data={assets} />)

    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument()
    expect((await screen.findAllByRole('heading', { name: 'KPI Alpha' })).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('heading', { name: 'Storyboard Gamma' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: 'Layout Beta' })).not.toBeInTheDocument()
  })

  test('filters the list when a tab is selected', async () => {
    const user = userEvent.setup()
    renderWithStore(<Library data={assets} />)

    await screen.findAllByRole('heading', { name: 'KPI Alpha' })
    await user.click(screen.getByRole('link', { name: 'KPI' }))

    expect((await screen.findAllByRole('heading', { name: 'KPI Alpha' })).length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Storyboard Gamma' })).not.toBeInTheDocument()
    })
  })

  test('shows matching search results and an empty message', async () => {
    const user = userEvent.setup()
    renderWithStore(<Library data={assets} />)

    await screen.findAllByRole('heading', { name: 'KPI Alpha' })

    await user.type(screen.getByPlaceholderText('Type to search...'), 'layout')
    expect(await screen.findByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Layout Beta' }).length).toBeGreaterThan(0)

    await user.clear(screen.getByPlaceholderText('Type to search...'))
    await user.type(screen.getByPlaceholderText('Type to search...'), 'zzzz')
    expect(await screen.findByText('No matching result')).toBeInTheDocument()
  })

  test('shows the Show more control when there are extra assets', async () => {
    const manyAssets = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: `Asset ${index + 1}`,
      description: 'desc',
      date: '01/01/2004',
      asset_type: 'KPI',
      likes: index,
      featured: true,
    }))

    renderWithStore(<Library data={manyAssets} />)

    const showMore = await screen.findByRole('link', { name: 'Show more' })
    expect(showMore).not.toHaveClass('hidden')
  })

  test('shows favourites saved in the store', async () => {
    const store = makeStore()
    store.dispatch(toggleFavourite({ id: 1, name: 'KPI Alpha' }))

    renderWithStore(<Library data={assets} />, store)

    expect(await screen.findByText('Favourites (1)')).toBeInTheDocument()
    expect(screen.queryByText('None yet. Open an asset and tap Favourite item.')).not.toBeInTheDocument()
  })
})
