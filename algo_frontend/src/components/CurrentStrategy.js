/* Import Libs */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useEffect, useState } from "react"

/* Import Constants */
import { TIMEFRAMES } from "../constants"

/* Import Components */
import CurrencyLogo from "./CurrencyLogo"
import Trades from "./Trades"
import View from "./reusables/View"
import StrategyComparisonChart from "./reusables/Chart"

/* Import Styles */
import { CurrentStrategyStyle } from "../styles/CurrentStrategy"

/* Import Utils */
import { capitalize } from "../utils/string"
import { getDuration } from "../utils/date"

/* Import WebApi */
import { getRunning } from "../webapi/strategy"
import { run } from "../webapi/backtesting"
import { list as listExchanges } from "../webapi/exchanges"
import { list } from "../webapi/trade"

/* Import Images */
import logoBinance from "../images/logos/exchanges/binance.svg"
import Box from "./reusables/Box"

const CurrentStrategy = () => {
  const [strategy, strategyFunc] = useState({
    loading: false,
    data: {
      currencies: [],
      indicators_label: [],
    },
  })

  const [trades, tradesFunc] = useState({
    loading: false,
    data: [],
  })

  const [exchanges, exchangesFunc] = useState({
    loading: false,
    data: [],
  })

  const [selectedDates, setSelectedDates] = useState({
    start: "2024-01-01",
    end: "2024-01-21",
  })

  const [candleticks, candleticksFunc] = useState({
    loading: false,
    data: [],
  })

  //Here we should fetch the actual information from the database.
  const generateStockPerformanceData = () => {
    const startDate = new Date(2024, 0, 1)
    const endDate = new Date(2024, 0, 20)
    const weeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000))

    const stockData = []

    for (let i = 0; i < weeks; i++) {
      const weekStartDate = new Date(startDate)
      weekStartDate.setDate(startDate.getDate() + i * 7)

      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)

      const pv = Math.random() * 10000 - 5000
      const uv = Math.random() * 10000 - 5000

      stockData.push({
        name: `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
        startDate: weekStartDate,
        pv,
        uv,
      })
    }

    return stockData
  }

  //Here we should fetch the actual information from the database.
  const generateTradingData = () => {
    const startDate = new Date(2024, 0, 1)
    const endDate = new Date(2024, 0, 20)
    const days = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000))

    const tradingData = []

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      tradingData.push({
        date: date,
        strategy: (Math.random() * 100 + 500).toFixed(1),
        buyAndHold: (Math.random() * 100 + 500).toFixed(1),
      })
    }

    return tradingData
  }

  const tradingChartData = generateTradingData()

  const stockPerformanceChartData = generateStockPerformanceData()

  const filteredStockPerformanceData = stockPerformanceChartData
    .filter(
      (item) =>
        item.startDate >= new Date(selectedDates.start) &&
        item.startDate <= new Date(selectedDates.end)
    )
    .map((entry) => ({
      ...entry,
    }))

  const filteredTradingChartData = tradingChartData
    .filter(
      (item) =>
        item.date >= new Date(selectedDates.start) &&
        item.date <= new Date(selectedDates.end)
    )
    .map((entry) => ({
      ...entry,
      date: entry.date.toLocaleDateString(),
    }))

  const transformToView = (data) => {
    const transformDuration = (state, start, end) => {
      switch (state) {
        case "created":
          return ""
        case "running":
          return getDuration(start, Date.now() / 1000)
        case "finished":
          return getDuration(start, end)
        default:
          return ""
      }
    }

    const transformTimeframe = (timeframe) => {
      return TIMEFRAMES.find((timeframe_) => timeframe_.value === timeframe)
        ?.label
    }

    const initialBalance = data.initial_balance
    const currentBalance = parseFloat(data.current_balance).toFixed(2)
    const profitAndLoss = (currentBalance - initialBalance).toFixed(2)
    const profitAndLossPercentaje = (
      (currentBalance / initialBalance - 1) *
      100
    ).toFixed(2)

    return {
      ...data,
      current_balance: parseFloat(data.current_balance).toFixed(2),
      profit_and_loss_label: `${profitAndLoss} (${profitAndLossPercentaje}%)`,
      indicators_label: (data.indicators || []).map((indicator) => ({
        ...indicator,
        name: (() => {
          switch (indicator.name) {
            case "rsi":
              return "RSI"
            default:
              return capitalize(indicator.name)
          }
        })(),
        parameters: Object.keys(indicator.parameters).map((key) => ({
          key: key
            .split("_")
            .map((word) => capitalize(word))
            .join(" "),
          value: indicator.parameters[key],
        })),
      })),
      duration: transformDuration(
        data.state,
        data.start_timestamp,
        data.end_timestamp
      ),
      timeframe_label: transformTimeframe(data.timeframe),
    }
  }

  const getTrades = (strategyId) => {
    return new Promise((resolve, reject) => {
      tradesFunc((prevState) => ({
        ...prevState,
        loading: true,
      }))
      list(strategyId)
        .then((response) => {
          tradesFunc((prevState) => ({
            ...prevState,
            loading: false,
            data: response.data,
          }))
          resolve(response.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  const getStrategy = () => {
    return new Promise((resolve, reject) => {
      strategyFunc((prevState) => ({
        ...prevState,
        loading: true,
      }))
      getRunning()
        .then((response) => {
          strategyFunc((prevState) => ({
            ...prevState,
            loading: false,
            data: transformToView(response.data),
          }))
          resolve(response.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  const getExchanges = () => {
    return new Promise((resolve, reject) => {
      exchangesFunc((prevState) => ({
        ...prevState,
        loading: true,
      }))
      listExchanges()
        .then((response) => {
          exchangesFunc((prevState) => ({
            ...prevState,
            loading: false,
            data: response.data,
          }))
          resolve(response.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  const getCandleticks_ = (
    symbol,
    start,
    end,
    timeframe,
    initial_balance,
    indicators
  ) => {
    const transformToView = (data) => {
      return {
        ...data,
        [symbol]: {
          ...data[symbol],
          series: data[symbol].series.map((row) => ({
            ...row,
            balance_buy_and_hold: row.balance_buy_and_hold.toFixed(2),
            balance_strategy: row.balance_strategy.toFixed(2),
          })),
        },
      }
    }

    const body = {
      coins: [symbol],
      initial_balance,
      data_from: start,
      data_to: end,
      timeframe,
      indicators,
      type: "spot",
    }
    run(body)
      .then((response) => {
        candleticksFunc((prevState) => ({
          ...prevState,
          loading: true,
          data: transformToView(response.data || []),
        }))
      })
      .catch((err) => {})
  }

  useEffect(() => {
    if (
      strategy.data.currencies[0] &&
      strategy.data.start_timestamp &&
      strategy.data.timeframe
    ) {
      getCandleticks_(
        strategy.data.currencies[0],
        strategy.data.start_timestamp,
        parseInt(Date.now() / 1000),
        strategy.data.timeframe.toLowerCase(),
        parseInt(strategy.data.initial_balance),
        strategy.data.indicators
      )
    }
  }, [
    // eslint-disable-line
    strategy.data.currencies,
    strategy.data.start_timestamp,
    strategy.data.end_timestamp,
    strategy.data.timeframe,
  ])

  const getState = () => {
    getStrategy()
      .then((strategy) => {
        getTrades(strategy.id)
      })
      .catch((_) => {})
  }

  useEffect(() => {
    getExchanges()
  }, [])

  useEffect(() => {
    const interval = setInterval(getState, 10000)
    getState()

    return () => {
      clearInterval(interval)
    }
  }, []) // eslint-disable-line

  return (
    <View
      title="Running Strategy"
      loading={strategy.loading}
      content={
        <CurrentStrategyStyle>
          <div className="summary">
            <h2>Summary</h2>
            <div className="summary-content">
              <Box
                label="Initial Balance"
                value={strategy.data.initial_balance}
              />
              <Box
                label="Current Balance"
                value={
                  trades.data.length === 0
                    ? strategy.data.initial_balance
                    : strategy.data.current_balance
                }
              />
              <Box
                label="Profit/Loss"
                value={
                  trades.data.length === 0
                    ? "0 (0%)"
                    : strategy.data.profit_and_loss_label
                }
              />
              <Box
                label="Exchange"
                value={
                  <div className="exchange-wrapper">
                    <p>
                      {
                        exchanges.data.find(
                          (exchange) =>
                            exchange.id === strategy.data.exchange_id
                        )?.alias
                      }
                    </p>
                    {exchanges.data.find(
                      (exchange) => exchange.id === strategy.data.exchange_id
                    )?.exchange_name === "binance" && (
                      <img alt="Binance" src={logoBinance} width="24px" />
                    )}
                  </div>
                }
              />
              <Box
                label="Currencies"
                value={strategy.data.currencies.map((currency) => (
                  <div className="currency-wrapper">
                    <CurrencyLogo currency={currency} />
                  </div>
                ))}
              />
              <Box
                label="Indicators"
                value={strategy.data.indicators_label.map((indicator) => (
                  <div className="indicator-wrapper">{indicator.name}</div>
                ))}
              />
              <Box label="Duration" value={strategy.data.duration} />
              <Box label="Timeframe" value={strategy.data.timeframe_label} />
              <Box label="# Trades" value={trades.data.length} />
            </div>
          </div>
          {trades.data.length > 0 && (
            <div className="trades">
              <h2>Trades</h2>
              <Trades strategyID={strategy.data.id} />
            </div>
          )}
          {trades.data.length > 0 && (
            <div>
              <h2>Graphs</h2>
              <div>
                <h3>Comparison of Strategies</h3>
                <StrategyComparisonChart
                  data={candleticks.data[strategy.data.currencies[0]]?.series}
                  colors={["#87CEEB", "#00FF00"]}
                  logScaleDefault={true}
                  hideBrush={true}
                  hideLogSwitch={true}
                  height={400}
                />
              </div>
              {false && (
                <div className="graph-item">
                  <h3>Weekly Stock Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      width={500}
                      height={300}
                      data={filteredStockPerformanceData}
                      stackOffset="sign"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid stroke="none" strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        label={{
                          value: "Profit/Loss",
                          angle: -90,
                          position: "insideLeft",
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <ReferenceLine y={0} stroke="#484a4d" />
                      <Bar
                        dataKey="pv"
                        name="Current Strategy"
                        fill="#8884d8"
                        stackId="stack"
                      />
                      <Bar
                        dataKey="uv"
                        name="Buy and Hold"
                        fill="#82ca9d"
                        stackId="stack"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </CurrentStrategyStyle>
      }
    />
  )
}

export default CurrentStrategy
