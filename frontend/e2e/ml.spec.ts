import { expect, test } from '@playwright/test'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

test('ML models: all six features render real results after login', async ({ page }) => {
  const responses: string[] = []
  page.on('response', (r) => {
    if (r.url().includes('/api/ml')) responses.push(r.url())
  })

  await page.goto('/login')
  await page.getByLabel('Username').fill('analyst')
  await page.getByLabel('Password').fill('analyst123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await page.getByRole('link', { name: 'ML Models' }).click()
  await expect(page).toHaveURL(/\/models/)
  await expect(page.getByRole('heading', { name: 'ML Models' })).toBeVisible({ timeout: 60_000 })

  // Wait for all ML sections to finish (safe upper bound for all 6 to complete)
  for (let i = 0; i < 120; i++) {
    if (responses.filter((u) => u.includes('/api/ml/segments') && u.includes('products')).length > 0) {
      // allow a small grace window
      await sleep(1000)
      break
    }
    await sleep(1000)
  }

  // Registry populated
  await expect(page.getByTestId('ml-registry')).toBeVisible()

  // Forecasts
  await expect(page.getByTestId('forecast-orders')).toBeVisible()
  await expect(page.getByTestId('forecast-revenue')).toBeVisible()
  await expect(page.getByTestId('forecast-result-orders')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByTestId('forecast-result-revenue')).toBeVisible({ timeout: 90_000 })

  // Segments
  await expect(page.getByTestId('segments-customers')).toBeVisible()
  await expect(page.getByTestId('segments-products')).toBeVisible()
  await expect(page.getByTestId('segments-result-customers')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByTestId('segments-result-products')).toBeVisible({ timeout: 90_000 })
  await expect(page.getAllByTestId('cluster-row').first()).toBeVisible()

  // Anomalies
  await expect(page.getByTestId('anomalies')).toBeVisible()
  await expect(page.getByTestId('anomalies-result')).toBeVisible({ timeout: 90_000 })
  await expect(page.getAllByTestId('anomaly-row').first()).toBeVisible()

  // Sales prediction form and its instruction about no date filter
  await expect(page.getByTestId('sales-prediction')).toBeVisible()
  await expect(page.getByText(/shared date-range filters do not apply/i)).toBeVisible()

  // Quick smoke predict: set items to 2 and get a numeric BRL result
  await page.getByTestId('predict-items').fill('2')
  await page.getByTestId('predict-submit').click()
  await expect(page.getByTestId('predict-result')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByTestId('predict-result')).toContainText('R$')
})

test('ML models: date filters reach the data-driven endpoints', async ({ page }) => {
  const fetched: string[] = []
  page.on('request', (r) => {
    if (r.url().includes('/api/ml/forecast') || r.url().includes('/api/ml/segments') || r.url().includes('/api/ml/anomalies')) {
      fetched.push(r.url())
    }
  })

  await page.goto('/login')
  await page.getByLabel('Username').fill('analyst')
  await page.getByLabel('Password').fill('analyst123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('link', { name: 'ML Models' }).click()
  await expect(page.getByRole('heading', { name: 'ML Models' })).toBeVisible()

  // apply date range
  await page.getByTestId('ml-date-from').fill('2018-01-01')
  await page.getByTestId('ml-date-to').fill('2018-06-30')
  await page.getByTestId('ml-apply-filters').click()

  await page.waitForFunction(
    () => {
      return document
        .querySelectorAll('[data-testid="applied-filters"]')
        .some((el) => el.textContent?.includes('2018-01-01 → 2018-06-30'))
    },
    { timeout: 60_000 },
  )

  // verify at least forecast requests include date filters
  const hasDateFilteredForecast = fetched.some((u) => u.includes('date_from=2018-01-01') && u.includes('date_to=2018-06-30'))
  expect(hasDateFilteredForecast).toBe(true)
})
