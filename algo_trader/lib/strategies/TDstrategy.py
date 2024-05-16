from lib.actions import Action
from lib.indicators.indicator import Indicator
from lib.strategies.strategy import Strategy
from lib.strategies.base_strategies.TrendDetectionBase import TrendDetectionBase
from typing import List, Tuple
from collections import Counter

import pandas as pd
import numpy as np

class TDstrategy(Strategy):
    def __init__(self, indicators: List[Indicator], timeframe: str, id: str):
        self.name = "TD"

        # TODO: check to parameterize this data
        self.rounds_ema = 14
        self.rounds_dmi = 5
        self.rounds_adx = 5
        self.threshold_adx = 20
        self.period_slope = 5
        self.tdb = TrendDetectionBase(self.rounds_ema, self.rounds_dmi, self.rounds_adx, self.threshold_adx, self.period_slope)   

        super().__init__(indicators, timeframe, id)

    def prepare_data(self, historical_data: pd.DataFrame):
        print(self.name + " | begin prepare")
        self.data = historical_data[["Open", "High", "Low", "Close", "Volume"]]
        self.data[["High", "Low", "Close", "Volume", "Open"]] = self.data[["High", "Low", "Close", "Volume", "Open"]].apply(pd.to_numeric)
        print(self.name + " | end prepare")

    def predict(self, new_record):
        new_record[["High", "Low", "Close", "Volume", "Open"]] = new_record[["High", "Low", "Close", "Volume", "Open"]].apply(pd.to_numeric)

        # print(self.name + " | prediction")

        self.data = pd.concat([self.data, new_record], ignore_index=True)
        oldest_index = self.data.index[0]
        self.data = self.data.drop(oldest_index)

        confirmed_signals_df = self.tdb.get_confirmed_signals(self.data)

        signals = []
        
        for indicator in self.indicators:
            indicator.calculate(self.data, False)
            indicator_signals = indicator.generate_signals()
            PointEntry = np.where((indicator_signals == 1) & (confirmed_signals_df["ConfirmedEntrySignal"] != np.nan), 1, 0)
            PointExit = np.where((indicator_signals == -1) & (confirmed_signals_df["ConfirmedOutputSignal"] != np.nan), -1, 0)
            signal = PointEntry + PointExit
            signals.append(signal[signal.size -1])

        signal_counter = Counter(signals)
        result_signal = signal_counter.most_common(1)[0][0]

        if result_signal == -1:
            result_signal = Action.SELL
        elif result_signal == 1:
            result_signal = Action.BUY
        else:
            result_signal = Action.HOLD
        # print("signal", result_signal)
        return result_signal
    
    def execute_backtest(self, historical_data: pd.DataFrame, initial_balance, fixed_commission, variable_commission_rate) -> Tuple[pd.DataFrame, float]:
        split_index = 20 # FIXME
        
        first_data = historical_data.iloc[:split_index]
        last_data = historical_data.iloc[split_index:]

        self.prepare_data(first_data)
        signals = []
        for index, row in last_data.iterrows():
            row_df = pd.DataFrame(row).transpose()
            signal = self.predict(row_df)
            signals.append(signal)

        actions = pd.DataFrame({'signal': signals}, index=last_data.index)



        trades = self._get_trades(actions, fixed_commission, variable_commission_rate)
        final_balance = self._calculate_final_balance(last_data, trades, initial_balance)

        return trades, final_balance
    

    def _get_trades(self, actions: pd.DataFrame, fixed_commission, variable_commission_rate) -> pd.DataFrame:
        # WIP
        pairs = actions.loc[actions['signal'] == Action.BUY]
        odds = actions.loc[actions['signal'] == Action.SELL]

        trades = pd.concat([pairs, odds], axis=1)
        trades.columns = ['buy_date', 'buy_signal', 'sell_date', 'sell_signal']
        trades['buy_price'] = trades['buy_signal'].apply(lambda x: x if x != Action.BUY else np.nan)
        trades['sell_price'] = trades['sell_signal'].apply(lambda x: x if x != Action.SELL else np.nan)

        trades = trades.dropna()

        trades['commission'] = fixed_commission + trades['buy_price'] * variable_commission_rate
        trades['buy_price'] += trades['commission']
        trades['sell_price'] -= trades['commission']

        trades['return'] = (trades['sell_price'] / trades['buy_price']) - 1

        return trades
    
    def _calculate_final_balance(self, data, trades, starting_capital=10000):
        # WIP
        if trades.empty:
            return starting_capital

        last_signal = data['signal'].iloc[-1]
        if last_signal == Action.BUY:
            current_price = data['Close'].iloc[-1]
            open_trade_price = data['Close'].iloc[-2]
            unrealized_pnl = (current_price / open_trade_price) - 1
        else:
            unrealized_pnl = 0

        cumulative_return = trades['return'].sum()

        final_balance = starting_capital * (1 + cumulative_return + unrealized_pnl)

        return final_balance