from algo_lib.actions import Action
from algo_lib.indicators.indicator import Indicator
import numpy as np
import pandas as pd


class Crossing(Indicator):
    def __init__(self, buy_threshold, sell_threshold, fast, slow):
        self.fast = fast
        self.slow = slow
        super().__init__("Cruce", buy_threshold, sell_threshold)

    def calculate(self, data):
        df = pd.DataFrame(index=data.index)
        self.data = data
        df["Close"] = data["Close"]
        df[self.name] = (
            df.Close.rolling(self.fast).mean() / df.Close.rolling(self.slow).mean() - 1
        )
        self.output = df[self.name]
        return self.output

    def calc_sell_signals(self):
        return np.where(self.output < self.sell_threshold, True, False)

    def calc_buy_signals(self):
        return np.where(self.output > self.buy_threshold, True, False)

    def predict_signal(self, new_record):
        new_output = self.calculate(pd.concat([self.data, new_record]))

        new_signal = new_output.iloc[-1]

        if new_signal < self.sell_threshold:
            return Action.SELL
        elif new_signal > self.buy_threshold:
            return Action.BUY
        else:
            return Action.HOLD