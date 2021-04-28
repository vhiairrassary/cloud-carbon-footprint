/*
 * © 2021 ThoughtWorks, Inc.
 */

import EstimatorCache from './EstimatorCache'
import { EstimationResult } from './EstimationResult'
import { promises as fs } from 'fs'
import moment from 'moment'

export const cachePath = process.env.CCF_CACHE_PATH || 'estimates.cache.json'
export const testCachePath = 'estimates.cache.test.json'
const loadedCache = process.env.USE_TEST_CACHE ? testCachePath : cachePath

export default class EstimatorCacheFileSystem implements EstimatorCache {
  getEstimates(): Promise<EstimationResult[]> {
    return this.loadEstimates()
  }

  async setEstimates(estimates: EstimationResult[]): Promise<void> {
    const cachedEstimates = await this.loadEstimates()

    return fs.writeFile(
      loadedCache,
      JSON.stringify(cachedEstimates.concat(estimates)),
      'utf8',
    )
  }

  private async loadEstimates(): Promise<EstimationResult[]> {
    let data = '[]'
    try {
      data = await fs.readFile(loadedCache, 'utf8')
    } catch (error) {
      console.warn(
        'WARN: Unable to read cache file. Got following error: \n' + error,
        '\n',
        'Creating new cache file...',
      )
      await fs.writeFile(loadedCache, '[]', 'utf8')
    }
    const dateTimeReviver = (key: string, value: string) => {
      if (key === 'timestamp') return moment.utc(value).toDate()
      return value
    }
    return JSON.parse(data, dateTimeReviver)
  }
}
