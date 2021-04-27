/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  EstimationRequest,
  configLoader,
  EstimationResult,
  cache,
  FilterResult,
  getAccounts,
} from '@cloud-carbon-footprint/core'
import AzureAccount from './AzureAccount'
export default class App {
  @cache()
  async getAzureConsumptionManagementData(
    request: EstimationRequest,
  ): Promise<EstimationResult[]> {
    const startDate = request.startDate
    const endDate = request.endDate
    const config = configLoader()
    const AZURE = config.AZURE
    const AzureEstimatesByRegion: EstimationResult[][] = []
    if (AZURE?.USE_BILLING_DATA) {
      const azureAccount = new AzureAccount()
      await azureAccount.initializeAccount()
      const estimates = await azureAccount.getDataFromConsumptionManagement(
        startDate,
        endDate,
      )
      AzureEstimatesByRegion.push(estimates)
    }

    return AzureEstimatesByRegion.flat()
  }

  getFilterData(): FilterResult {
    return { accounts: getAccounts() }
  }
}
