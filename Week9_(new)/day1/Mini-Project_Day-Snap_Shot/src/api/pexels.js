const API_KEY = import.meta.env.VITE_PEXELS_API_KEY
const BASE_URL = 'https://api.pexels.com/v1/search'

export const PER_PAGE = 30

export async function searchPhotos(query, page = 1, perPage = PER_PAGE) {
  if (!API_KEY) {
    throw new Error(
      'Missing Pexels API key. Add VITE_PEXELS_API_KEY to a .env file (see .env.example).'
    )
  }

  const url = `${BASE_URL}?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const response = await fetch(url, {
    headers: { Authorization: API_KEY },
  })

  if (!response.ok) {
    throw new Error(`Pexels API request failed with status ${response.status}`)
  }

  return response.json()
}
