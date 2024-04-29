from lib.indicators import *
from lib.strategies.strategy import Strategy
from lib.strategies.basic import Basic
from typing import Dict

def hydrate_strategy( currencies, indicators, timeframe, id) -> Dict[str, Strategy]:
    strategy = {}
    for currency in currencies:
        indicators_builded = []

        for indicator in indicators:
            indicator_name = indicator["name"]
            indicator_params = indicator["parameters"]
            
            indicator_class = globals().get(indicator_name)
            if indicator_class is None:
                print(f"Indicator {indicator_name} not found.")
                continue
            
            instance = indicator_class.hydrate(indicator_params)
            if instance is not None:
                indicators_builded.append(instance)

        
        strategy[currency] = Basic(indicators_builded, timeframe, id)

    return strategy