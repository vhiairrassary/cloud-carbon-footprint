/*
 * © 2021 ThoughtWorks, Inc.
 */

import IFootprintEstimator from './IFootprintEstimator'
import FootprintEstimate from './FootprintEstimate'
import ComputeUsage from './ComputeUsage'
import CloudConstantsUsage from './CloudConstantsUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (
  averageCPUUtilization: number,
  virtualCPUHours: number,
  cloudProvider: string,
  region: string,
  computeProcessors: string[] = [],
  minWatts: number,
  maxWatts: number,
  powerUsageEffectiveness: number,
) => {
  const calculatedMinWatts = minWatts
    ? minWatts
    : CLOUD_CONSTANTS[cloudProvider].getMinWatts(computeProcessors)
  const calculatedMaxWatts = maxWatts
    ? maxWatts
    : CLOUD_CONSTANTS[cloudProvider].getMaxWatts(computeProcessors)
  const calculatedPowerUsageEffectiveness = powerUsageEffectiveness
    ? powerUsageEffectiveness
    : CLOUD_CONSTANTS[cloudProvider].getPUE(region)
  return (
    ((calculatedMinWatts +
      (averageCPUUtilization / 100) *
        (calculatedMaxWatts - calculatedMinWatts)) *
      virtualCPUHours *
      calculatedPowerUsageEffectiveness) /
    1000
  )
}

export default class ComputeEstimator implements IFootprintEstimator {
  estimate(
    data: ComputeUsage[],
    region: string,
    cloudProvider: string,
    computeProcessors?: string[],
    emissionsFactors?: { [region: string]: number },
    constants?: CloudConstantsUsage,
  ): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedKilowattHours = ENERGY_ESTIMATION_FORMULA(
        usage.cpuUtilizationAverage,
        usage.numberOfvCpus,
        cloudProvider,
        region,
        computeProcessors,
        constants?.minWatts,
        constants?.maxWatts,
        constants?.powerUsageEffectiveness,
      )

      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        cloudProvider,
        region,
        emissionsFactors,
      )
      return {
        timestamp: usage.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
        usesAverageCPUConstant: usage.usesAverageCPUConstant,
      }
    })
  }
}
