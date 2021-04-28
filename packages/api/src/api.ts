/*
 * © 2021 ThoughtWorks, Inc.
 */

import express from 'express'

import {
  App,
  CreateValidRequest,
  EstimationRequestValidationError,
  PartialDataError,
  CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  Logger,
  RawRequest,
  reduceByTimestamp,
} from '@cloud-carbon-footprint/core'

import {
  App as AzureApp,
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '@cloud-carbon-footprint/azure'
import _ from 'lodash'

export type EmissionsFactors = {
  region: string
  mtPerKwHour: number
}

const apiLogger = new Logger('api')

/**
 * Returns the raw estimates
 *
 * Query params:
 * start - Required, UTC start date in format YYYY-MM-DD
 * end - Required, UTC start date in format YYYY-MM-DD
 */
const FootprintApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  // Set the request time out to 10 minutes to allow the request enough time to complete.
  req.socket.setTimeout(1000 * 60 * 10)
  const rawRequest: RawRequest = {
    startDate: req.query.start?.toString(),
    endDate: req.query.end?.toString(),
  }
  apiLogger.info(
    `Footprint API request started with Start Date: ${rawRequest.startDate} and End Date: ${rawRequest.endDate}`,
  )
  const footprintApp = new App()
  const azureFootprintApp = new AzureApp()
  try {
    const estimationRequest = CreateValidRequest(rawRequest)
    const estimationResults = await footprintApp.getCostAndEstimates(
      estimationRequest,
    )
    const azureEstimationResults = await azureFootprintApp.getAzureConsumptionManagementData(
      estimationRequest,
    )
    if (_.isEqual(estimationResults, azureEstimationResults)) {
      res.json(reduceByTimestamp(estimationResults))
    } else {
      res.json(
        reduceByTimestamp(estimationResults.concat(azureEstimationResults)),
      )
    }
  } catch (e) {
    apiLogger.error(`Unable to process footprint request.`, e)
    if (e instanceof EstimationRequestValidationError) {
      res.status(400).send(e.message)
    } else if (e instanceof PartialDataError) {
      res.status(416).send(e.message)
    } else res.status(500).send('Internal Server Error')
  }
}

const EmissionsApiMiddleware = async function (
  req: express.Request,
  res: express.Response,
): Promise<void> {
  apiLogger.info(`Regions emissions factors API request started`)
  try {
    const emissionsResults: EmissionsFactors[] = Object.values(
      CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    ).reduce((cloudProviderResult, cloudProvider) => {
      return Object.keys(cloudProvider).reduce((emissionDataResult, key) => {
        cloudProviderResult.push({
          region: key,
          mtPerKwHour: cloudProvider[key],
        })
        return emissionDataResult
      }, cloudProviderResult)
    }, [])

    const azureEmissionsResults: EmissionsFactors[] = getCloudProviderEmissionsFactors(
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
    )

    res.json(emissionsResults.concat(azureEmissionsResults))
  } catch (e) {
    apiLogger.error(`Unable to process regions emissions factors request.`, e)
    res.status(500).send('Internal Server Error')
  }
}

const getCloudProviderEmissionsFactors = (emissionsFactors: {
  [region: string]: number
}): EmissionsFactors[] => {
  return Object.keys(emissionsFactors).reduce((emissionDataResult, key) => {
    emissionDataResult.push({
      region: key,
      mtPerKwHour: emissionsFactors[key],
    })
    return emissionDataResult
  }, [])
}

const router = express.Router()

router.get('/footprint', FootprintApiMiddleware)
router.get('/regions/emissions-factors', EmissionsApiMiddleware)

export default router
