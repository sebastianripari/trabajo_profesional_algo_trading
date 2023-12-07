from algo_lib.actions import Action
from algo_lib.trade import Trade
from algo_lib.exchanges.exchange import Exchange

class Dummy(Exchange):
    def __init__(self):
        super().__init__()
        self.trades = []

    def place_order(self, trade: Trade):
        action = trade.action
        symbol = trade.symbol
        amount = trade.amount
        price_per_unit = trade.price_per_unit

        if action == Action.BUY:
            self.buy(symbol, amount, price_per_unit)
            self.trades.append(trade)
            self.total= amount*price_per_unit
            print(f"Actual portfolio: {self.portfolio}")
            print(f"Actual USDT balance: {self.balance}")
            print(f"Actual total: {self.total}")
            print(f"----------------")
        elif action == Action.SELL:
            self.sell(symbol, amount, price_per_unit)
            self.total= amount*price_per_unit

            print(f"Actual portfolio: {self.portfolio}")
            print(f"Actual USDT balance: {self.balance}")
            print(f"Actual total: {self.total}")

            print(f"----------------")
        else:
            raise ValueError(
                f"Invalid action: {action}. Only 'buy' and 'sell' actions are supported."
            )

    def buy(self, symbol: str, amount: int, price_per_unit: float):
        super().buy(symbol, amount, price_per_unit)
        print(f"Buying {amount} units of {symbol} at {price_per_unit} on Dummy Exchange.")

    def sell(self, symbol: str, amount: int, price_per_unit: float):
        super().sell(symbol, amount, price_per_unit)
        print(f"Selling {amount} units of {symbol} at {price_per_unit} on Dummy Exchange.")
