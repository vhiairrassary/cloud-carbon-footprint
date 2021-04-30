/*
 * © 2021 ThoughtWorks, Inc.
 */

import FootprintEstimate from './FootprintEstimate'
import IFootprintEstimator from './IFootprintEstimator'
import StorageUsage from './StorageUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'
import CloudConstantsUsage from './CloudConstantsUsage'

export default class StorageEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: StorageUsage[],
    region?: string,
    cloudProvider?: string,
    emissionsFactors?: { [region: string]: number },
    constants?: CloudConstantsUsage,
  ): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        d.terabyteHours,
        cloudProvider,
        region,
        constants?.powerUsageEffectiveness,
      )

      return {
        timestamp: d.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimateCo2(
          estimatedKilowattHours,
          cloudProvider,
          region,
          emissionsFactors,
        ),
      }
    })
  }

  private estimateKilowattHours(
    terabyteHours: number,
    cloudProvider: string,
    region: string,
    powerUsageEffectiveness: number,
  ) {
    // This function multiplies the usage in terabyte hours this by the SSD or HDD co-efficient,
    // then by PUE to account for extra power used by data center (lights, infrastructure, etc.), then converts to kilowatt-hours
    const calculatedPowerUsageEffectiveness = powerUsageEffectiveness
      ? powerUsageEffectiveness
      : CLOUD_CONSTANTS[cloudProvider].getPUE(region)
    return (
      (terabyteHours * this.coefficient * calculatedPowerUsageEffectiveness) /
      1000
    )
  }
}
