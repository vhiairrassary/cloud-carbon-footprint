/*
 * © 2021 ThoughtWorks, Inc.
 */

import IFootprintEstimator from './IFootprintEstimator'
import FootprintEstimate from './FootprintEstimate'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'
import NetworkingUsage from './NetworkingUsage'
import CloudConstantsUsage from './CloudConstantsUsage'

export default class NetworkingEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: NetworkingUsage[],
    region: string,
    cloudProvider: string,
    emissionsFactors?: { [region: string]: number },
    constants?: CloudConstantsUsage,
  ): FootprintEstimate[] {
    return data.map((data: NetworkingUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabytes,
        cloudProvider,
        region,
        constants?.powerUsageEffectiveness,
      )
      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        cloudProvider,
        region,
        emissionsFactors,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
      }
    })
  }
  private estimateKilowattHours(
    gigaBytes: number,
    cloudProvider: string,
    region: string,
    powerUsageEffectiveness: number,
  ) {
    // This function multiplies the usage amount in gigabytes by the networking coefficient, then the cloud provider PUE,
    // to get estimated kilowatt hours.
    const calculatedPowerUsageEffectiveness = powerUsageEffectiveness
      ? powerUsageEffectiveness
      : CLOUD_CONSTANTS[cloudProvider].getPUE(region)
    return gigaBytes * this.coefficient * calculatedPowerUsageEffectiveness
  }
}
