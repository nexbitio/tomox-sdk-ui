// @flow
import { push } from 'connected-react-router'

import {
  getAccountDomain,
  getLendingPairsDomain,
  getLendingTokensDomain,
} from '../../domains'

import * as actionCreators from '../../actions/lending/lendingMarkets'
import type { State, ThunkAction } from '../../../types'

export default function marketsTableSelector(state: State) {
  const accountDomain = getAccountDomain(state)
  // const loading = pairsDomain.loading()
  const referenceCurrency = accountDomain.referenceCurrency()
  // const favoriteds = pairsDomain.getFavoritePairs()

  // pairs = pairs.map(tokenPair => {
  //   tokenPair.favorited = favoriteds.includes(tokenPair.pair)
  //   return tokenPair
  // })
  const pairs = getLendingPairsDomain(state).getTokenPairsWithDataArray()
  const lendingTokensDomain = getLendingTokensDomain(state)
  const lendingTokens = lendingTokensDomain.tokenSymbols()

  return {
    // loading,
    pairs,
    lendingTokens,
    authenticated: accountDomain.authenticated(),
    currentReferenceCurrency: referenceCurrency ? referenceCurrency.symbol : '$',
  }
}

export function redirectToLendingPage(lendingPair): ThunkAction {
  return async (dispatch, getState) => {
    const param = lendingPair.replace(/\s+/g, '_').replace('/', '-').toUpperCase()
    dispatch(actionCreators.updateCurrentPair(lendingPair))
    dispatch(push(`/lending/${param}`))
  }
}

