# @cloud-carbon-footprint/client

## 0.8.0

### Minor Changes

- d24c1274: Change Carbon equivalency component to be globally relevant

  `packages/client/src/dashboard/CarbonComparisonCard.tsx`:

  ```diff
      // ...

          }
      })

  -    export const toMiles = (co2mt: number): number => co2mt * 2481.3918390475
  -    export const toGas = (co2mt: number): number => co2mt * 112.5247230304
  +    export const toFlights = (co2mt: number): number => co2mt * 1.2345679 // direct one way flight from NYC to London per metric ton per CO2
  +    export const toPhones = (co2mt: number): number => co2mt * 121643 // phones charged per metric ton of CO2
      export const toTrees = (co2mt: number): number => co2mt * 16.5337915448

      export const CarbonComparisonCard: FunctionComponent<CarbonComparisonCardProps> =

      // ...

          const [selection, setSelection] = useState('flights')
          const mtSum: number = sumCO2(data)

  -        const milesSum = toMiles(mtSum)
  -        const gasSum = toGas(mtSum)
  +        const totalFlights = toFlights(mtSum)
  +        const totalPhones = toPhones(mtSum)
          const treesSum = toTrees(mtSum)

  -        const formatNumber = (number: number, decimalPlaces = 0) =>
  -        number.toLocaleString(undefined, { maximumFractionDigits: decimalPlaces })
  +        const formatNumber = (number: number, decimalPlaces = 0) => {
  +        if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}+ B`
  +
  +        if (number >= 1000000) return `${(number / 1000000).toFixed(1)}+ M`
  +
  +        return number.toLocaleString(undefined, {
  +            maximumFractionDigits: decimalPlaces,
  +           })
  +        }

          const comparisons: Comparison = {
          flights: {
              icon: (
                  <FlightTakeoff className={classes.icon} data-testid="flightsIcon" />
              ),
  -            total: milesSum,
  -            textOne: 'greenhouse gas emissions from',
  -            textTwo: 'miles driven on average',
  +            total: totalFlights,
  +            textOne: 'CO2e emissions from',
  +            textTwo: 'direct one way flights from NYC to London',
          },
          phones: {
              icon: (
                  <PhonelinkRing className={classes.icon} data-testid="phonesIcon" />
              ),
  -            total: gasSum,
  +            total: totalPhones,
  -            textOne: 'CO2 emissions from',
  +            textOne: 'CO2e emissions from',
  -            textTwo: 'gallons of gasoline consumed',
  +            textTwo: 'smartphones charged',
          },
          trees: {
              icon: <Eco className={classes.icon} data-testid="treesIcon" />,

      // ...
  ```

- ababb826: Extracts two new packages app and common to avoid circular dependancies and make it easier to extract cloud provider packages
- e84a4c7a: Extract logic into the new packages: app, common, gcp, aws, azure:

  There are many files that have been updated/extracted.
  In order to update create-app templates, refer to the follow [commit](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/8c6aaed52e9f3949e134852986d50362aad3367a).

  The following changes were made to,
  'packages/create-app/templates/default-app/packages/client/tsconfig.json':

  ```diff
      // ...
          "skipLibCheck": true,
          "esModuleInterop": true,
          "allowSyntheticDefaultImports": true,
  -        "strict": true,
          "forceConsistentCasingInFileNames": true,
          "module": "esnext",
          "moduleResolution": "node",
          "resolveJsonModule": true,
  -        "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
  -        "noFallthroughCasesInSwitch": true
  +        "noFallthroughCasesInSwitch": true,
  +        "strict": false,
  +        "isolatedModules": true
        },
  -      "include": [
  -        "src",
  -        "node_modules/apexcharts/types/apexcharts.d.ts"
  -      ]
  +      "include": ["src"]
      }
      // ...
  ```

  Additionally, the following dependencies have been updated and should also be updated in their respective template package.json file:

  - @cloud-carbon-footprint root package.json:
    - "@types/fs-extra": "^9.0.11"
    - "concurrently": "^6.2.0"
    - "marked": ">=2.0.5"
  - @cloud-carbon-footprint/api and @cloud-carbon-footprint/cli:
    - "dotenv": "^10.0.0"
    - "@cloud-carbon-footprint/app": Can be added with `yarn up @cloud-carbon-footprint/app`
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`
  - @cloud-carbon-footprint/client:
    - "dotenv": "^10.0.0"
    - "@testing-library/react-hooks": "^7.0.0"
    - "concurrently": "^6.2.0"
    - "@cloud-carbon-footprint/common": Can be added with `yarn up @cloud-carbon-footprint/common`

### Patch Changes

- c7fa7db0: Updates dependencies to the latest
- e1353b87: Refactor CarbonComparisonCard to be more resuable with configuring comparison types
- c5889453: Updates CarbonFormulaDrawer to link to the microsite

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

          available.
          </Typography>
          <Link
  -          href="https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/trunk/microsite/docs/Methodology.md"
  +          href="https://www.cloudcarbonfootprint.org/docs/methodology"
            target="_blank"
            rel="noopener"
            className={classes.methodology}

      // ...
  ```

## 0.7.0

### Minor Changes

- 6917116b: Updates the formula in the sidebar with new sources for emissions factor:

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

      whiteSpace: 'pre-line',
      fontSize: typography.body2.fontSize,
      },
  + formula: {
  +   fontFamily: 'monospace',
  + },
      methodology: {
      padding: spacing(2),
      display: 'flex',

      // ...

      <Typography className={classes.content} component="p">
      Our CO2e Estimate Formula:
      </Typography>
  - <Typography className={classes.content} component="p">
  -   (Cloud provider service usage) x (Cloud provider Power Usage
  -   Effectiveness [PUE]) x (Cloud energy conversion factors [kWh]) x (EPA
  -   [US] or carbonfootprint.com [Non-US] grid emissions factors [CO2e])
  + <Typography
  +   className={clsx(classes.content, classes.formula)}
  +   component="p"
  + >
  +   (Cloud provider service usage) x (Cloud energy conversion factors
  +   [kWh]) x (Cloud provider Power Usage Effectiveness (PUE)) x (grid
  +   emissions factors [metric tons CO2e])
      </Typography>
      <Divider />
      <Typography className={classes.content} component="p">

      // ...
  ```

- f48a0f56: Updates the filter options to be a fixed header:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      import React, { ReactElement } from 'react'
      import { Container } from '@material-ui/core'
  + import { makeStyles } from '@material-ui/core/styles'
      import { Switch, Route } from 'react-router-dom'
      import ErrorPage from './dashboard/ErrorPage'
      import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
      import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'
      import HeaderBar from './dashboard/HeaderBar'

      function App(): ReactElement {
  +   const useStyles = makeStyles(() => ({
  +     appContainer: {
  +       padding: 0,
  +     },
  +   }))
  +
  +   const classes = useStyles()
  +
      return (
          <>
          <HeaderBar />

  -       <Container maxWidth={'xl'}>
  +       <Container maxWidth={'xl'} className={classes.appContainer}>
              <Switch>
              <Route path="/error" exact>
                  <ErrorPage />

      // ...
  ```

  `packages/client/src/dashboard/CloudCarbonContainer.tsx`:

  ```diff
      // ...

      const useStyles = makeStyles((theme) => ({
      boxContainer: {
      padding: theme.spacing(3, 10),
  +   marginTop: 62,
  + },
  + filterHeader: {
  +   top: 0,
  +   left: 'auto',
  +   position: 'fixed',
  +   marginTop: '64px',
  +   width: '100%',
  +   backgroundColor: '#fff',
  +   borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  +   zIndex: 1199,
  +   padding: '9px 10px 7px 10px',
      },
      filterContainer: {
      display: 'flex',
      flexWrap: 'wrap',
  -   paddingBottom: theme.spacing(1),
  +   justifyContent: 'center',
      },
      filter: {
      resize: 'none',
  -   padding: theme.spacing(PADDING_FILTER),
  -   paddingLeft: 0,
  +   padding: '2px 4px 0 4px',
      marginRight: theme.spacing(PADDING_FILTER),
      minWidth: '240px',
      },

      // ...

      </div>
      </Grid>
      ) : (
  -   <div className={classes.boxContainer}>
  -     <Grid container>
  +   <>
  +     <div className={classes.filterHeader}>
          <Grid item xs={12}>
              <div className={classes.filterContainer}>

      // ...

                  </div>
                  </div>
              </Grid>
  -         <Grid container spacing={3}>
  -           <Grid item xs={12}>
  -             <Card style={{ width: '100%', height: '100%' }}>
  -               <Box padding={3} paddingRight={4}>
  -                 {filteredData.length ? (
  -                   <ApexLineChart data={filteredData} />
  -                 ) : (
  -                   <div className={classes.noData}>
  -                     <p>Cloud Usage</p>
  -                     <NoDataPage isTop={true} />
  -                   </div>
  -                 )}
  -               </Box>
  -             </Card>
  -           </Grid>
  -           <Grid item xs={12}>
  -             <Grid
  -               container
  -               spacing={3}
  -               style={{
  -                 display: 'flex',
  -                 flexDirection: 'row',
  -                 flexWrap: 'wrap-reverse',
  -               }}
  -             >
  -               <Grid item className={classes.gridItemCards}>
  -                 <CarbonComparisonCard data={filteredData} />
  -               </Grid>
  -               <Grid item className={classes.gridItemCards}>
  -                 <EmissionsBreakdownContainer data={filteredData} />
  +       </div>
  +       <div className={classes.boxContainer}>
  +         <Grid container>
  +           <Grid container spacing={3}>
  +             <Grid item xs={12}>
  +               <Card style={{ width: '100%', height: '100%' }}>
  +                 <Box padding={3} paddingRight={4}>
  +                   {filteredData.length ? (
  +                     <ApexLineChart data={filteredData} />
  +                   ) : (
  +                     <div className={classes.noData}>
  +                       <p>Cloud Usage</p>
  +                       <NoDataPage isTop={true} />
  +                     </div>
  +                   )}
  +                 </Box>
  +               </Card>
  +             </Grid>
  +             <Grid item xs={12}>
  +               <Grid
  +                 container
  +                 spacing={3}
  +                 style={{
  +                   display: 'flex',
  +                   flexDirection: 'row',
  +                   flexWrap: 'wrap-reverse',
  +                 }}
  +               >
  +                 <Grid item className={classes.gridItemCards}>
  +                   <CarbonComparisonCard data={filteredData} />
  +                 </Grid>
  +                 <Grid item className={classes.gridItemCards}>
  +                   <EmissionsBreakdownContainer data={filteredData} />
  +                 </Grid>
                  </Grid>
                  </Grid>
              </Grid>
              </Grid>
  -       </Grid>
  -     </div>
  +       </div>
  +     </>
      )
      }
  ```

- c89184bb: Indicates Cloud Provider on the Emissions Breakdown Bar Chart:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      export interface Entry {
  -   x: string
  +   x: string[]
      y: number
      }

      // ...

  - const dataEntries: { x: string; y: number }[] = Object.entries(barChartData)
  -   .filter((item) => item[1] > 0)
      .map((item) => ({
  -     x: item[0],
  -     y: item[1],
  -   }))
  -   .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

  + const dataEntries: { x: string[]; y: number }[] = Object.entries(barChartData)
  +   .filter((item) => item[1][1] > 0)
      .map((item) => ({
  +     x: [item[0], `(${item[1][0]})`],
  +     y: item[1][1],
      }))
      .sort((higherC02, lowerCO2) => lowerCO2.y - higherC02.y)

      // ...

      ): string[] => {
      const regionColorsMap: string[] = []
      pageData.data.forEach((region) => {
  -     const currentRegion = region.x
  +     const currentRegion = region.x[0]
          let color = chartBarCustomColors[0]
      // ...
  ```

  `packages/client/src/dashboard/charts/ApexDonutChart.tsx`:

  ```diff
      // ...

      }[] = Object.entries(donutData)
      .map((item) => ({
          serviceOrRegion: item[0],
  -     c02Value: item[1],
  +     c02Value: item[1][1],
      }))

      // ...
  ```

  `packages/client/src/dashboard/transformData.tsx`:

  ```diff
      // ...

      const sumCO2ByServiceOrRegion = (
      data: EstimationResult[],
      dataType: string,
  - ): { string: number } => {
  + ): { string: [string, number] } => {
      const serviceEstimates = data.flatMap(
          (estimationResult) => estimationResult.serviceEstimates,
      )

  -   return serviceEstimates.reduce((acc, initialValue, index, arr) => {
  +   return serviceEstimates.reduce((acc, _initialValue, index, arr) => {
          const value = arr[index]

          checkUnknownTypes(dataType, value)

          const property = getPropertyFromDataType(dataType, value)

          if (acc.hasOwnProperty(property)) {
  -       acc[property] += value.co2e // { ec2: 18 }
  +       acc[property] = [value.cloudProvider, acc[property][1] + value.co2e] // { ec2: 18 }
          } else {
  -       acc[property] = value.co2e
  +       acc[property] = [value.cloudProvider, value.co2e]
          }

          return acc
      }, Object.create({}))
      }

      // ...
  ```

### Patch Changes

- f48a0f56: Fixes issue with labels for emission breakdown chart being cut off:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

          xaxis: {
          type: 'category',
          labels: {
  -        show: false,
  +        style: {
  +           fontSize: 0,
  +         },
          },
          axisBorder: {
              show: false,
          },
          max: maxThreshold,
          },
          yaxis: {
          labels: {
              style: {
              fontSize: '13px',
              },
          },
          },
          tooltip: {
          fillSeriesColor: false,
  -       x: {
  -         show: false,
  -       },
          y: {
              formatter: function (value: number, opts: { dataPointIndex: number }) {
              return `${dataEntries[

      // ...
  ```

- 56bb6da6: #244 Bug fixed by changing configs boolean conditionals:
  In order to update, you need to apply the following changes in the `client` package:

  `packages/client/src/dashboard/CarbonFormulaDrawer.tsx`:

  ```diff
      // ...

        }
      }

  -    const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE
  +    const previousYearOfUsage =
  +        !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE &&
  +        process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE !== 'false'

      const appConfig: ClientConfig = {
          CURRENT_PROVIDERS: [

      // ...
  ```

- b63d8a67: The default `aws-sdk` dependency was bumped to `"^2.890.0"`,
- 8b81e904: removes end date env variable:

  `packages/client/src/Config.ts`:

  ```diff
      // ...
          VALUE: string
          TYPE: string
      }
  -   END_DATE: string | null
      }

      const previousYearOfUsage = !!process.env.REACT_APP_PREVIOUS_YEAR_OF_USAGE

      // ...

          VALUE: process.env.REACT_APP_DATE_RANGE_VALUE || '12',
          TYPE: process.env.REACT_APP_DATE_RANGE_TYPE || 'months',
      },
  -   END_DATE: process.env.REACT_APP_END_DATE || null,
      }

      export default appConfig
  ```

      `packages/client/src/dashboard/CloudCarbonContainer.tsx`:

  ```diff
      // ...

      const dateRangeType: string = config().DATE_RANGE.TYPE
      const dateRangeValue: string = config().DATE_RANGE.VALUE
  - let endDate: moment.Moment
  + const endDate: moment.Moment = moment.utc()
      let startDate: moment.Moment
  - if (config().END_DATE) {
  -   endDate = moment.utc(config().END_DATE)
  - } else {
  -   endDate = moment.utc()
  - }
      if (config().PREVIOUS_YEAR_OF_USAGE) {
      startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
      } else {
  -   startDate = config().END_DATE ? moment.utc(config().END_DATE) : moment.utc()
  -   startDate.subtract(
  -     dateRangeValue,
  -     dateRangeType as unitOfTime.DurationConstructor,
  -   )
  +   startDate = moment
  +     .utc()
  +     .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
      }

      // ...
  ```

- f48a0f56: Fixes shifting of the bars on the Emissions Breakdown BarChart:

  `packages/client/src/dashboard/charts/ApexBarChart.tsx`:

  ```diff
      // ...

      xaxis: {
          type: 'category',
          labels: {
  -       style: {
  -         fontSize: 0,
  -       },
  +       show: false,
          },
          axisBorder: {
          show: false,
          },
          max: maxThreshold,
      },
      yaxis: {
          labels: {
          style: {
              fontSize: '13px',
          },
  +       align: 'left',
  +       formatter: function (value: string) {
  +         if (typeof value === 'string' && value.length > 15) {
  +           return value.substring(0, 15) + '...'
  +         }
  +         return value
  +       },
          },
      },
      tooltip: {

      // ...
  ```

- 3e759462: Fixes spacing and alignment issues for right-sided axes for the Cloud Usage graph:

  `packages/client/src/Config.ts`:

  ```diff
      // ...

              fontSize: '15px',
          },
          },
  -     forceNiceScale: true,
  +     tickAmount: 10,
          decimalsInFloat: 3,
      },
      {
          max: 1.1 * maxKilowattHours,
          title: {
  -       text: 'kilowatt hours (kWh)',
  +       text: 'Kilowatt Hours (kWh)',
          opposite: -8,
          style: {
              fontSize: '15px',
              color: yellow,
          },
          },
  +     tickAmount: 10,
          decimalsInFloat: 2,
          opposite: true,
          axisBorder: {
          show: true,
          color: yellow,
          },
          axisTicks: {
  -       show: true,
  -       offsetX: -30,
  +       show: false,
          },
  -     forceNiceScale: true,
          showAlways: false,
      },
      {
          max: 1.1 * maxCost,

      // ...

              color: green,
          },
          },
  +     tickAmount: 10,
          decimalsInFloat: 2,
          opposite: true,
          axisBorder: {
          show: true,
          color: green,
          offsetX: -5,
          },
          axisTicks: {
  -       show: true,
  -       offsetX: -30,
  +       show: false,
          },
  -     forceNiceScale: true,
          showAlways: false,
      },
      ],

      // ...
  ```

## 0.6.0

### Minor Changes

- ce391719: Updates the filter options to be a fixed header

### Patch Changes

- 86a11f4e: Fixes issue with labels for emission breakdown chart being cut off
- 67867f37: Fixes shifting of the bars on the Emissions Breakdown BarChart

## 0.5.2

### Patch Changes

- 81dfde6c: Improves .env.template files with links to cofiguration glossary

## 0.5.1

### Patch Changes

- 6d43b26f: fixes type issue with apex charts
- 58064ebd: fixes unknown region display name
- c0cc067a: adds initial create app package

## 0.5.0

### Minor Changes

- 66676453: Fix: react hook error when loading data

### Patch Changes

- 8175b41d: updates packages with readmes and metadata

## 0.4.0

### Minor Changes

- 033a504: adds integration testing
- f33b9eb: adds color to regior bar chart based on carbon intensity

### Patch Changes

- c2b24e7: fix tests to use mock remote hooks
- 063ae7d: updates jest, immer and testing library dependencies

## 0.3.0

### Minor Changes

- 75176d7: Updates the cloud provider queries to be configurable by grouping dates and allows configurable date ranges

### Patch Changes

- 1977dd4: Adds null check AccountChooser
- e2ac070: Fixes default config for querying data

## 0.2.0

### Minor Changes

- 96cb023: Adds support for Microsoft Azure, as well as updates to the microsite.

## 0.1.0

### Minor Changes

- 3b3bec3: Update packages to have base version
