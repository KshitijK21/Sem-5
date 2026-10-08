import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Models from '@/pages/Models'
import {
  getAnomalies,
  getCustomerSegments,
  getForecast,
  getMlStatus,
  getProductSegments,
  predictSales,
} from '@/services/api'

vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api')>()
  return {
    ...actual,
    getMlStatus: vi.fn(),
    getForecast: vi.fn(),
    getCustomerSegments: vi.fn(),
    getProductSegments: vi.fn(),
    getAnomalies: vi.fn(),
    predictSales: vi.fn(),
  }
})

const mockStatus = vi.mocked(getMlStatus)
const mockForecast = vi.mocked(getForecast)
const mockCustomers = vi.mocked(getCustomerSegments)
const mockProducts = vi.mocked(getProductSegments)
const mockAnomalies = vi.mocked(getAnomalies)
const mockPredict = vi.mocked(predictSales)

function forecastFixture(target: 'orders' | 'revenue', historyDays = 634) {
  return {
    model: `sales_forecast_${target}`,
    algorithm: 'LinearRegression',
    target,
    unit: target === 'revenue' ? 'BRL' : 'orders',
    status: 'success',
    periods: 2,
    history_tail: [
      { date: '2018-09-01', value: 10 },
      { date: '2018-09-02', value: 12 },
    ],
    forecast: [
      { date: '2018-09-03', value: 11 },
      { date: '2018-09-04', value: 13 },
    ],
    metrics: {
      model: { mae: 4.4, rmse: 6.1 },
      seasonal_naive_baseline: { mae: 7.2, rmse: 9.3 },
      n_train: 500,
      n_test: 60,
    },
    metadata: {
      trained_at: '2026-10-03T12:00:00Z',
      artifact: `ml/models/sales_forecast_${target}.joblib`,
      n_history_days: historyDays,
      generated_at: '2026-10-08T10:00:00Z',
    },
  }
}

const statusFixture = {
  features: [
    {
      name: 'forecasting',
      status: 'available',
      models: [
        {
          name: 'sales_forecast_orders',
          algorithm: 'LinearRegression',
          target: 'orders',
          features: ['lag1', 'lag7'],
          trained_at: '2026-10-03T12:00:00Z',
          metrics: { model: { mae: 4.4 } },
          artifact_available: true,
          inference: 'inference_ready' as const,
        },
        {
          name: 'sales_forecast_revenue',
          algorithm: 'LinearRegression',
          target: 'revenue',
          features: ['lag1', 'lag7'],
          trained_at: '2026-10-03T12:00:00Z',
          metrics: null,
          artifact_available: false,
          inference: 'unavailable' as const,
          reason: 'artifact not found on this host',
        },
      ],
    },
  ],
}

const customerSegFixture = {
  model: 'customer_segmentation',
  algorithm: 'KMeans',
  target: 'customer_cluster',
  status: 'success',
  inference: {
    n_customers: 96096,
    k: 2,
    features: ['recency_days', 'frequency', 'monetary_log'],
    clusters: [
      { cluster: 0, customers: 93099, share: 0.969, mean_recency_days: 180, mean_frequency: 1.2, mean_monetary: 180 },
      { cluster: 1, customers: 2997, share: 0.031, mean_recency_days: 40, mean_frequency: 4.1, mean_monetary: 950 },
    ],
  },
  metrics: { k: 2, silhouette: 0.61 },
  metadata: { trained_at: '2026-10-03T12:00:00Z', generated_at: '2026-10-08T10:00:00Z' },
}

const productSegFixture = {
  model: 'product_segmentation',
  algorithm: 'KMeans',
  target: 'product_cluster',
  status: 'success',
  inference: {
    n_products: 32951,
    k: 4,
    features: ['qty_log', 'revenue_log', 'avg_price', 'product_weight_g'],
    clusters: [
      { cluster: 0, products: 2187, share: 0.066, mean_total_qty: 4, mean_total_revenue: 300, mean_avg_price: 80, mean_product_weight_g: 700 },
      { cluster: 1, products: 6746, share: 0.205, mean_total_qty: 2, mean_total_revenue: 120, mean_avg_price: 60, mean_product_weight_g: 500 },
      { cluster: 2, products: 23279, share: 0.706, mean_total_qty: 1.4, mean_total_revenue: 60, mean_avg_price: 55, mean_product_weight_g: 450 },
      { cluster: 3, products: 739, share: 0.022, mean_total_qty: 3, mean_total_revenue: 250, mean_avg_price: 90, mean_product_weight_g: 600 },
    ],
  },
  metrics: { k: 4, silhouette: 0.52 },
  metadata: { trained_at: '2026-10-03T12:00:00Z', generated_at: '2026-10-08T10:00:00Z' },
}

const anomaliesFixture = {
  model: 'anomaly_detection',
  algorithm: 'IsolationForest',
  target: 'is_anomaly',
  status: 'success',
  inference: {
    n_days: 634,
    n_anomalies: 19,
    anomaly_share: 19 / 634,
    contamination: 0.03,
    score_definition: 'decision_function; lower = more unusual',
    evaluated_from: '2016-10-03',
    evaluated_to: '2018-10-17',
    top_anomalies: [
      { date: '2017-11-24', orders: 132, revenue: 21000, score: -0.14, is_anomaly: true },
      { date: '2017-11-25', orders: 118, revenue: 18500, score: -0.12, is_anomaly: true },
    ],
  },
  metrics: { contamination: 0.03, n_days: 634, n_anomalies: 19 },
  metadata: { trained_at: '2026-10-03T12:00:00Z', generated_at: '2026-10-08T10:00:00Z' },
}

const predictFixture = {
  predicted_item_revenue: 205.96,
  currency: 'BRL',
  model: 'sales_prediction',
  algorithm: 'Pipeline(GradientBoostingRegressor)',
  target: 'item_revenue',
  status: 'success',
  metrics: { selected: 'gbr', candidates: { gbr: { mae: 41.2, rmse: 96.1 } } },
  metadata: { trained_at: '2026-10-03T12:00:00Z', generated_at: '2026-10-08T10:00:00Z' },
}

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('Models page (ML integration)', () => {
  beforeEach(() => {
    mockStatus.mockResolvedValue(statusFixture)
    mockForecast.mockImplementation(async (opts) => forecastFixture(opts?.target ?? 'orders'))
    mockCustomers.mockResolvedValue(customerSegFixture)
    mockProducts.mockResolvedValue(productSegFixture)
    mockAnomalies.mockResolvedValue(anomaliesFixture)
    mockPredict.mockResolvedValue(predictFixture)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads every section through the API on mount (no static content)', async () => {
    render(<Models />)

    expect(screen.getByRole('heading', { level: 1, name: 'ML Models' })).toBeInTheDocument()

    await screen.findByTestId('forecast-result-orders')
    await screen.findByTestId('forecast-result-revenue')
    await screen.findByTestId('segments-result-customers')
    await screen.findByTestId('segments-result-products')
    await screen.findByTestId('anomalies-result')
    await screen.findAllByTestId('registry-model-name')

    expect(mockForecast).toHaveBeenCalledTimes(2)
    expect(mockForecast).toHaveBeenCalledWith(
      expect.objectContaining({ periods: 30, target: 'orders' }),
    )
    expect(mockForecast).toHaveBeenCalledWith(
      expect.objectContaining({ periods: 30, target: 'revenue' }),
    )
    expect(mockCustomers).toHaveBeenCalledTimes(1)
    expect(mockProducts).toHaveBeenCalledTimes(1)
    expect(mockAnomalies).toHaveBeenCalledTimes(1)
    // the sales form is button-driven, never fired on mount
    expect(mockPredict).not.toHaveBeenCalled()

    // real model outputs are rendered
    expect(screen.getAllByTestId('cluster-row')).toHaveLength(6)
    expect(screen.getAllByTestId('anomaly-row')).toHaveLength(2)
    expect(screen.getAllByText(/Holdout MAE \(model\)/)).toHaveLength(2)
    expect(screen.getAllByText(/training evaluation/).length).toBeGreaterThan(0)
  })

  it('shows the inference-unavailable state from the registry', async () => {
    render(<Models />)
    await screen.findAllByTestId('registry-model-name')
    expect(screen.getAllByText('unavailable').length).toBeGreaterThan(0)
    expect(screen.getByText('artifact not found on this host')).toBeInTheDocument()
    expect(screen.getAllByText('inference ready').length).toBeGreaterThan(0)
  })

  it('surfaces backend error details in the failing section', async () => {
    mockForecast.mockImplementation(async (opts) => {
      if (opts?.target === 'orders') throw new Error('Not enough history in the selected range')
      return forecastFixture(opts?.target ?? 'revenue')
    })

    render(<Models />)

    const err = await screen.findByTestId('forecast-error-orders')
    expect(err).toHaveTextContent('Not enough history in the selected range')
    // other sections still render
    await screen.findByTestId('forecast-result-revenue')
    await screen.findByTestId('anomalies-result')
  })

  it('passes the selected horizon to the API when changed', async () => {
    render(<Models />)
    await screen.findByTestId('forecast-result-orders')

    const select = screen.getByTestId('horizon-orders')
    fireEvent.change(select, { target: { value: '60' } })

    await waitFor(() =>
      expect(mockForecast).toHaveBeenCalledWith(
        expect.objectContaining({ periods: 60, target: 'orders' }),
      ),
    )
  })

  it('refetches filtered sections with the applied date range', async () => {
    render(<Models />)
    await screen.findByTestId('forecast-result-orders')

    fireEvent.change(screen.getByTestId('ml-date-from'), { target: { value: '2017-01-01' } })
    fireEvent.change(screen.getByTestId('ml-date-to'), { target: { value: '2017-12-31' } })
    fireEvent.click(screen.getByTestId('ml-apply-filters'))

    await waitFor(() =>
      expect(mockForecast).toHaveBeenCalledWith(
        expect.objectContaining({ date_from: '2017-01-01', date_to: '2017-12-31' }),
      ),
    )
    await waitFor(() =>
      expect(mockAnomalies).toHaveBeenCalledWith({
        date_from: '2017-01-01',
        date_to: '2017-12-31',
      }),
    )
    await waitFor(() => {
      const shown = screen
        .getAllByTestId('applied-filters')
        .filter((el) => el.textContent?.includes('Filters: 2017-01-01 → 2017-12-31'))
      expect(shown.length).toBeGreaterThan(0)
    })
  })

  it('validates the sales form client-side and predicts through the API', async () => {
    render(<Models />)
    await screen.findByTestId('sales-prediction')
    expect(screen.getByText(/shared date-range filters do not/)).toBeInTheDocument()

    // invalid: 0 items rejected before any request
    fireEvent.change(screen.getByTestId('predict-items'), { target: { value: '0' } })
    fireEvent.click(screen.getByTestId('predict-submit'))
    expect(await screen.findByTestId('predict-error')).toHaveTextContent(
      'Fix the highlighted fields',
    )
    expect(mockPredict).not.toHaveBeenCalled()

    // valid: request goes out and the model output is shown
    fireEvent.change(screen.getByTestId('predict-items'), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('predict-submit'))

    const result = await screen.findByTestId('predict-result')
    expect(result).toHaveTextContent('R$ 205.96')
    expect(mockPredict).toHaveBeenCalledWith(
      expect.objectContaining({ n_items: 2, customer_state: 'SP' }),
    )
  })

  it('never lets a slow older response overwrite a newer one', async () => {
    const slow = deferred<ReturnType<typeof forecastFixture>>()
    const fast = forecastFixture('orders', 634)
    const updated = forecastFixture('orders', 500)

    mockForecast
      .mockImplementationOnce(() => slow.promise)
      .mockImplementation(async (opts) =>
        opts?.target === 'orders' ? fast : forecastFixture('revenue'),
      )

    render(<Models />)
    await waitFor(() => expect(mockForecast).toHaveBeenCalledTimes(2))

    // filters change while the first orders run is still in flight → newer request
    fireEvent.change(screen.getByTestId('ml-date-from'), { target: { value: '2017-01-01' } })
    fireEvent.click(screen.getByTestId('ml-apply-filters'))

    const ordersCard = screen.getByTestId('forecast-orders')
    await within(ordersCard).findByTestId('forecast-result-orders')
    expect(within(ordersCard).getByText(/634 days/)).toBeInTheDocument()

    // the older response arrives late: it must be discarded
    slow.resolve(updated)
    await new Promise((r) => setTimeout(r, 20))
    expect(within(ordersCard).getByText(/634 days/)).toBeInTheDocument()
    expect(within(ordersCard).queryByText(/500 days/)).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId('applied-filters')
        .some((el) => el.textContent?.includes('Filters: 2017-01-01')),
    ).toBe(true)
  })

  it('shows an empty state when no anomalies are found', async () => {
    mockAnomalies.mockResolvedValue({
      ...anomaliesFixture,
      inference: { ...anomaliesFixture.inference, n_anomalies: 0, anomaly_share: 0, top_anomalies: [] },
    })

    render(<Models />)
    const empty = await screen.findByTestId('anomalies-empty')
    expect(empty).toHaveTextContent('No anomalies detected for the selected period.')
  })
})
