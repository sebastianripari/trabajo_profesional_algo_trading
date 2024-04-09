/* Import Libs */
import { useState } from "react"
import styled from "styled-components"

/* Import Components */
import CurrencyLogo from "../components/CurrencyLogo"

/* Import Reusables Components */
import FieldSelect from "../components/reusables/FieldSelect"
import Button from "../components/Button"
import { add } from "../webapi/strategy"

const StrategyStyle = styled.div`
  display: flex;
  flex-direction: column;

  & .actions {
    display: flex;
    justify-content: end;
    margin-top: 20px;
    margin-bottom: 20px;

    & .cancel {
      margin-right: 10px;
    }
  }
`

const OptionStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 60px;
  max-height: 20px;

  & img {
    width: 20px;
    height: 20px;
  }
`

const Currency = ({ currency }) => {
  return (
    <OptionStyle>
      <p>{currency}</p>
      <CurrencyLogo currency={currency} />
    </OptionStyle>
  )
}

const CURRENCIES = ["BTC", "ETH", "SOL"]
const INDICATORS = ["EMA", "RSI", "MACD"]

const Strategy = ({ onCloseModal, onAdd }) => {
  const [strategy, strategyFunc] = useState({
    loading: false,
    data: {},
  })

  const onChange = (key, value) => {
    strategyFunc((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        [key]: value,
      },
    }))
  }

  const transformToSend = (data) => {
    const createParameters = (indicator) => {
      // to-do: able to set this parameters in the ui
      switch (indicator) {
        case "RSI":
          return { buy_threshold: 30, rounds: 14, sell_threshold: 71 }
        case "MACD":
          return { slow: 26, fast: 12, smoothed: 20 }
        case "EMA":
          return { rounds: 100 }
        default:
          return {}
      }
    }

    return {
      currencies: strategy.data.currencies.map((row) => row.value),
      indicators: strategy.data.indicators.map((row) => {
        return {
          name: row.value,
          parameters: createParameters(row.value),
        }
      }),
    }
  }

  const onSave = () => {
    strategyFunc((prevState) => ({
      ...prevState,
      loading: true,
    }))

    add(transformToSend(strategy.data))
      .then((_) => {
        strategyFunc((prevState) => ({
          ...prevState,
          loading: false,
        }))
        onCloseModal()
        onAdd()
      })
      .catch((_) => {
        strategyFunc((prevState) => ({
          ...prevState,
          loading: false,
        }))
      })
  }

  return (
    <StrategyStyle>
      <FieldSelect
        name="currencies"
        label="Currencies"
        value={strategy.currencies}
        onChange={onChange}
        options={CURRENCIES.map((currency) => ({
          value: currency,
          label: <Currency currency={currency} />,
        }))}
      />
      <FieldSelect
        name="indicators"
        label="Indicators"
        value={strategy.indicators}
        onChange={onChange}
        options={INDICATORS.map((indicator) => ({
          value: indicator,
          label: indicator,
        }))}
      />
      <div className="actions">
        <div className="cancel">
          <Button text="Cancel" onClick={onCloseModal} />
        </div>
        <Button text="Save" onClick={onSave} loading={strategy.loading} />
      </div>
    </StrategyStyle>
  )
}

export default Strategy