declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => AutocompleteService
          PlacesServiceStatus: {
            OK: string
            ZERO_RESULTS: string
            OVER_QUERY_LIMIT: string
            REQUEST_DENIED: string
            INVALID_REQUEST: string
          }
        }
      }
    }
  }
}

interface AutocompleteService {
  getPlacePredictions(
    request: {
      input: string
      types?: string[]
    },
    callback: (predictions: any[] | null, status: string) => void
  ): void
  getQueryPredictions(
    request: any,
    callback: (predictions: any[] | null, status: string) => void
  ): void
}

export {} 