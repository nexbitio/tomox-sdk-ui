// @flow
import BigNumber from 'bignumber.js'

const initialState = {
  loading: false,
  byHash: {},
}

export const initialized = () => {
  const event = (state: OrdersState = initialState) => state
  return event
}

export function ordersInitialized(orders) {
  const event = (state) => {
    const newState = orders.reduce((result, item) => {
      result[item.hash] = {
        ...state[item.hash],
        ...item,
      }
      return result
    }, {})

    return { 
      ...state,
      byHash: newState,
    }
  }

  return event
}

export function updateOrders(orders: Orders) {
  const event = (state: OrdersState) => {
    const newState = orders.reduce((result, item) => {
      result[item.hash] = {
        ...state[item.hash],
        ...item,
      }
      return result
    }, {})

    return {
      ...state,
      byHash: {
        ...state.byHash,
        ...newState,
      },
    }
  }

  return event
}

export function lendingOrdersUpdateLoading(loading: Boolean) {
  const event = (state: OrdersState) => {
    return {
      ...state,
      loading,
    }
  }

  return event
}

export const ordersDeleted = (hashes: Array<number>) => {
  const event = (state: OrdersState) => ({
    ...state,
    byHash: Object.keys(state.byHash)
      .filter(key => hashes.indexOf(key) === -1)
      .reduce((result, current) => {
        result[current] = state.byHash[current]
        return result
      }, {}),
  })

  return event
}

export const ordersReset = () => {
  const event = _ => initialState
  return event
}

const getOrders = (state: OrdersState): Orders => {
  const orders = Object.keys(state.byHash).map(key => state.byHash[key])
  return JSON.parse(JSON.stringify(orders))
}

export default function ordersDomain(state: OrdersState) {
  return {
    byHash: () => state.byHash,
    all: () => getOrders(state),
    loading: () => state.loading,

    lastOrders: (n: number): Orders => {
      let orders: Orders = getOrders(state)
      orders = orders.slice(Math.max(orders.length - n, 0))
      orders = orders.map(order => {
        const filledPercent = order.filledAmount ? BigNumber(order.filledAmount).times(100).div(order.amount) : 0
        const filled = order.filledAmount
        const amount = order.amount
        const cancelAble = (order.status === 'OPEN' || order.status === 'PARTIAL_FILLED') && (order.orderID !== '0')
        return { ...order, filledPercent, filled, amount, cancelAble }
      })

      return orders
    },

    history: (): Orders => {
      const orders: Orders = getOrders(state)
      const history = orders.filter(
        order =>
          ['CANCELLED', 'FILLED', 'PARTIALLY_FILLED'].indexOf(order.status) ===
          -1,
      )
      return history
    },

    current: (): Orders => {
      const orders: Orders = getOrders(state)
      const current = orders.filter(
        order => ['NEW', 'OPEN'].indexOf(order.status) === -1,
      )
      return current
    },
    getOrderByHash: (hash) => state.byHash[hash],
  }
}