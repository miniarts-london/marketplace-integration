import { LIST_REVALIDATE_SECONDS, DETAIL_REVALIDATE_SECONDS } from '../config'

export function ssrApiGet(
    url: string,
    // Number = cache with Next.js's Data Cache and revalidate after this
    // many seconds (ISR-style). `false` or omitted = always fetch fresh
    // (no-store), which is only appropriate for client-side calls where
    // Next's fetch cache doesn't apply anyway.
    revalidate?: number | false,
    // Cache tags for this fetch. Lets a future mutation call
    // revalidateTag(tag) to invalidate this entry on demand, instead of
    // waiting out the revalidate window above. Ignored when revalidate is
    // falsy, since no-store fetches are never cached in the first place.
    tags?: string[],
  ) {

    return fetch(url, {
      ...(revalidate
        ? { next: { revalidate, ...(tags ? { tags } : {}) } }
        : { cache: 'no-store' as const }),
    }).catch((err) => {
      console.log(`Failed ssrApiGet '${url}'`)
      throw err
    })
}

export async function ssrApiGetJson<T>(
    path: string,
    revalidate?: number | false,
    tags?: string[],
  ): Promise<T> {
    const res = await ssrApiGet(path, revalidate, tags)
    return res.json()
}

// fetch data from service-express API
export async function getAssetDetails(
    id: number
  ) 
  {
    const host = 'https://service-express-nine.vercel.app'
    // const host = 'http://localhost:3000'
    const url = `${host}/api/asset/${id}`
  
    const res = await ssrApiGet(url, DETAIL_REVALIDATE_SECONDS, ['assets', `asset-${id}`])

    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return res.json()
   
}

// fetch data from service-express API
export async function fetchAssetListFromAPI(){
  const host = 'https://service-express-nine.vercel.app'
  // const host = 'http://localhost:3000'
  const url = `${host}/api/asset`
 
  const res = await ssrApiGet(url, LIST_REVALIDATE_SECONDS, ['assets'])

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

// This used to fetch our own /api/assetList route over HTTP from a
// server component — a self-inflicted network hop, since the route and
// this code run in the same deployment. Server components should call
// `queryAssetList()` from `app/utils/db/assetList.ts` directly instead;
// this file stays fetch-based/client-safe (fetchAssetListFromAPI and
// fetchMetricData below still need it), so the direct-DB call lives in
// its own module rather than being added here.


export async function fetchMetricData(
  // id: number, 
  // useCache?: boolean
){
  const host = window.location.origin
  const url =`${host}/api/metricData`

  // This runs client-side (inside a useEffect), where Next.js's fetch
  // Data Cache doesn't apply — kept as no-store/always-fresh.
  const res = await ssrApiGet(url, false)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}
