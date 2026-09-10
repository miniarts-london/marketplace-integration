import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewAssetScreen } from './ViewAsset'
import { AssetDetail } from '../models/assets'
import { fetchMetricData } from '../utils/requests'
import { renderWithStore } from '../store/test-utils'

jest.mock('../utils/requests', () => ({
  fetchMetricData: jest.fn(),
  getAssetDetails: jest.fn(),
}))

jest.mock('../components/ViewChart', () => ({
  ViewChart: () => <div data-testid="view-chart" />,
}))

const mockedFetchMetricData = fetchMetricData as jest.MockedFunction<typeof fetchMetricData>

const kpiAsset: AssetDetail = {
  id: 1,
  name: 'KPI Alpha',
  description_short: 'Short KPI copy',
  description: 'Longer KPI description',
  asset_type: 'KPI',
  metrics: [11],
  charts: [],
  questions: [{ title: 'Revenue', question: 'Is revenue up?' }],
}

const layoutAsset: AssetDetail = {
  ...kpiAsset,
  id: 2,
  name: 'Layout Beta',
  asset_type: 'Layouts',
  used: 12,
  type: 'grid',
  pageNum: 3,
  date: '01/01/2004',
}

describe('ViewAssetScreen', () => {
  beforeEach(() => {
    mockedFetchMetricData.mockResolvedValue({
      metricData: { data: [] },
    } as Awaited<ReturnType<typeof fetchMetricData>>)
  })

  test('renders asset copy and the favourite action', async () => {
    renderWithStore(<ViewAssetScreen data={kpiAsset} assetType="KPI" />)

    expect(screen.getByRole('heading', { name: /KPI Alpha/i })).toBeInTheDocument()
    expect(screen.getByText('Short KPI copy')).toBeInTheDocument()
    expect(screen.getByText('Longer KPI description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /favourite item/i })).toBeInTheDocument()
    await waitFor(() => expect(mockedFetchMetricData).toHaveBeenCalled())
  })

  test('toggles favourite on the asset screen', async () => {
    const user = userEvent.setup()
    renderWithStore(<ViewAssetScreen data={kpiAsset} assetType="KPI" />)

    await user.click(screen.getByRole('button', { name: /favourite item/i }))
    expect(screen.getByRole('button', { name: /remove favourite/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove favourite/i }))
    expect(screen.getByRole('button', { name: /favourite item/i })).toBeInTheDocument()
  })

  test('shows the KPI view for KPI assets', async () => {
    renderWithStore(<ViewAssetScreen data={kpiAsset} assetType="KPI" />)

    expect(screen.getByText('Metric IDs:')).toBeInTheDocument()
    expect(screen.getByText('Business questions')).toBeInTheDocument()
    await waitFor(() => expect(mockedFetchMetricData).toHaveBeenCalled())
  })

  test('shows the layout view for layout assets', async () => {
    renderWithStore(<ViewAssetScreen data={layoutAsset} assetType="Layouts" />)

    expect(screen.getByText('LAYOUT')).toBeInTheDocument()
    expect(screen.getByText('Used KPI')).toBeInTheDocument()
    await waitFor(() => expect(mockedFetchMetricData).toHaveBeenCalled())
  })
})
