from lib.indicators.indicator import Indicator
from lib.actions import Action
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import talib

class KONCORDE(Indicator):
    def __init__(self, rounds):
        self.rounds = rounds
        super().__init__("KONCORDE")

    def calculate(self, data):
        self.data = data
        df = pd.DataFrame(index=data.index)

        self.dates = data.index
        # Copy the 'Close' column from the original data to the DataFrame
        df["Close"] = data["Close"]

        tprice = (data['Open'] + data['High'] + data['Low'] + data['Close']) / 4

        data.interrows()

        pvi = data.ta.nvi(cumulative=True, append=False)
        pvim = talib.EMA(pvi, timeperiod=m)

        # Calculate the fast exponential moving average
        df["ema_fast"] = df.Close.ewm(span=self.fast).mean()

        # Calculate the slow exponential moving average
        df["ema_slow"] = df.Close.ewm(span=self.slow).mean()

        # The difference between the fast and slow moving averages is another moving average called MACD
        df["macd"] = df.ema_fast - df.ema_slow

        # Smooth the MACD and call it the 'signal'
        df["signal"] = df.macd.ewm(span=self.smoothed).mean()

        # Finally, the point of interest is the difference between the MACD and the signal
        # It is particularly interesting when it crosses zero.
        df["histogram"] = df.macd - df.signal

        # Drop any NaN values and round the DataFrame to two decimal places
        df = df.dropna().round(2)

        # Rename the 'histogram' column with the indicator name for convenience (notation abuse)
        df[self.name] = df["histogram"]
        self.output = df[self.name]
        return self.output

    def calc_buy_signals(self):
        return np.where((self.output.shift(1) < 0) & (0 < self.output), True, False)
    
    def calc_sell_signals(self):
        return np.where((self.output.shift(1) > 0) & (0 >= self.output), True, False)
    
    def plot(self):
        data = pd.DataFrame(self.output, index= self.dates)
        fig = plt.figure()
        fig.set_size_inches(30, 5)
        plt.plot(self.output)
        plt.grid()
        plt.axhline(0, linestyle='--', linewidth=1.5, color='black')
        plt.fill_between(data.index, self.output, 0, where=self.output>0, alpha=0.5, color='green')
        plt.fill_between(data.index, self.output, 0, where=self.output<0, alpha=0.5, color='red')
        plt.show()

    def predict_signal(self, new_record):
        new_macd_value = self.calculate(pd.concat([self.data, new_record]))
        sell_signal = self.calc_sell_signals()[-1]
        buy_signal = self.calc_buy_signals()[-1]

        new_signal = new_macd_value.iloc[-1]

        print(f'[MACD] Current value: {new_signal}')

        if sell_signal == True:
            signal = Action.SELL
        elif buy_signal == True:
            signal = Action.BUY
        else:
            signal = Action.HOLD

        print(f'[MACD] Signal: {signal}')
        
        return signal