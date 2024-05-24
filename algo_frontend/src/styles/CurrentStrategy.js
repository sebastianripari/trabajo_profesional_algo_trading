import styled from "styled-components"
import { theme } from "../utils/theme"

export const ResultStyle = styled.div`
  color: ${({ win }) => (win ? theme.green : theme.red)};
  font-weight: 600;
`

export const CurrentStrategyStyle = styled.div`
  height: 100%;
  width: 90%;

  & .summary {
    height: 120px;
    width: 100%;

    & .summary-content {
      display: flex;
      flex-direction: row;
      width: 70%;
      justify-content: space-around;

      & .box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 50px;
        border: 1px solid white;
        padding: 10px;
        border-radius: 4px;

        & .label {
          color: #a5a8b6;
        }

        & .value {
          display: flex;
          font-weight: 800;

          & .loader {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          & .indicator-wrapper {
            background: ${theme.white};
            color: ${theme.grayDark};
            padding: 3px;
            cursor: pointer;
            font-size: 12px;
            margin-right: 10px;
            font-weight: 400;
          }

          & .exchange-wrapper {
            display: flex;
            align-items: center;
            flex-direction: row;

            & p {
              margin: 0;
            }

            & img {
              margin-left: 5px;
            }
          }

          & .currency-wrapper {
            margin-right: 5px;
          }
        }
      }
    }
  }

  & .trades {
    height: calc(100% - 120px - 80px);
    width: 100%;
  }
  & .input-strategy {
    width: 70px;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid var(--text-dark);
    border-radius: 8px;
  }
`
