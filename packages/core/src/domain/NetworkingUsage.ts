/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
  readonly powerUsageEffectiveness?: number
  readonly networkingCoefficient?: number
}
