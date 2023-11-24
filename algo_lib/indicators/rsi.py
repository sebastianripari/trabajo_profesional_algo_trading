from indicators.indicator import Indicator
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

class RSI(Indicator):
  def __init__(self):
    super().__init__("RSI")

  def calculate(self, data,rounds = 14):
    # Create a DataFrame with the same index as the input data
    self.data= data
    df = pd.DataFrame(index=data.index)
    self.dates= data.index

    # Copy the 'Close' column from the original data to the new DataFrame
    df['Close'] = data['Close']

    # Calculate the difference in closing prices between the current and previous rows
    df['diff'] = df.Close.diff()

    # If the difference is greater than 0, set the 'win' column to the difference; otherwise, set it to 0
    df['win'] = np.where(df['diff'] > 0, df['diff'], 0)

    # If the difference is less than 0, set the 'loss' column to the absolute difference; otherwise, set it to 0
    df['loss'] = np.where(df['diff'] < 0, abs(df['diff']), 0)

    # Calculate the exponential moving average of the 'win' column
    df['EMA_win'] = df.win.ewm(alpha=1/rounds).mean()

    # Calculate the exponential moving average of the 'loss' column
    df['EMA_loss'] = df.loss.ewm(alpha=1/rounds).mean()

    # Calculate the ratio between the exponential moving averages ('RS' column)
    df['RS'] = df.EMA_win / df.EMA_loss
    df[self.name] = 100 - (100 /(1+df['RS'])) #TODO: Check vs alphavantage API

    # Calculate the final Relative Strength Index (RSI) using the calculated RS
    self.output = df[self.name]

    return self.output
  
  def calc_buy_signals(self):
    return np.where(self.output > 65, True, False)
  
  def calc_sell_signals(self):
    print(self.output)
    return np.where(self.output < 55, True, False)
 
  def plot(self):
    data = pd.DataFrame(self.output, index= self.dates)
    fig = plt.figure()
    fig.set_size_inches(30, 5)
    plt.plot(data[self.name])
    plt.show()

  def predict_signal(self, new_record):
      # Calcular RSI para el DataFrame actualizado
      new_rsi = self.calculate(pd.concat([self.data, new_record]), rounds=14)

      # Extraer el valor de RSI para el nuevo registro
      new_signal = new_rsi.iloc[-1]
      # Tomar decisiones de trading basadas en el valor de RSI
      if new_signal > 65:
          return "Sell"
      elif new_signal < 55:
          return "Buy"
      else:
          return "Hold"