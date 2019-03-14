// @flow
import React from 'react'
import styled from 'styled-components'
import { Loading, Colors } from '../Common'
import { Popover, Card, Position, AbstractPureComponent } from '@blueprintjs/core'

type BidOrAsk = {
  price: number,
  amount: number,
  total: number
};

type Props = {
  bids: Array<BidOrAsk>,
  asks: Array<BidOrAsk>
};

export class OrderBookRenderer extends React.PureComponent<Props> {
  state = {
    filter: 'all',
  }

  componentDidMount() {
    this.scrollToBottom('list-sell')
  }

  componentDidUpdate() {
    this.scrollToBottom('list-sell')
  }

  scrollToBottom(id: String) {
    if (this.state.filter !== 'all') return
    const $listSell = document.getElementById(id)
    $listSell.scrollTop = $listSell.scrollHeight
  }

  changeFilter(value: String) {
    this.setState({
      filter: value,
    })
  }

  getOrderBookClass() {
    const { filter } = this.state
    switch (filter) {
      case 'sell':
        return 'order-book sell'
      case 'buy':
        return 'order-book buy'
      default:
        return 'order-book all'
    }
  }

  render() {
    const { bids, asks } = this.props
    return (
      <Wrapper className={ this.getOrderBookClass() }>
        <OrderBookHeader className="order-book-header">
          <Title className="title">Orderbook</Title>

          <Popover
            content={'todo: decimals list'}
            position={Position.BOTTOM_RIGHT}
            minimal>
            <div className="decimals-dropdown">
              <span>7 decimals</span> 
              <span className="arrow-down"></span>
            </div>
          </Popover>

          <FilterList className="filter-list">
            <FilterSell className="filter filter-sell" onClick={() => this.changeFilter('sell')}><i>filter sell</i></FilterSell>
            <FilterAll className="filter filter-all" onClick={() => this.changeFilter('all')}><i>filter all</i></FilterAll>
            <FilterBuy className="filter filter-buy" onClick={() => this.changeFilter('buy')}><i>filter buy</i></FilterBuy>
          </FilterList>
        </OrderBookHeader>

        <OrderBookContent className="order-book-content all">
          {!bids && <Loading />}

          <ListHeading className="list-header">
            <HeaderRow>
              <HeaderCell width="33%" className="header-cell">Price</HeaderCell>
              <HeaderCell width="34%" className="header-cell text-right">Amount</HeaderCell>
              <HeaderCell width="33%" className="header-cell text-right">Volume</HeaderCell>
            </HeaderRow>
          </ListHeading>

          <ListContent className="list-container">
            {asks && (
              <List className="bp3-list-unstyled list list-sell" id="list-sell">
                {asks.map((order, index) => (
                  <SellOrder key={index} index={index} order={order} />
                ))}
              </List>
            )}

            {(asks.length > 0) && (
              <LatestTick className="latest-tick">
                <LatestPrice className="latest-price" width="67%">
                  <CryptoPrice className="crypto">282.6300000</CryptoPrice>
                  <CashPrice className="cash">$0.68</CashPrice>
                </LatestPrice>
                <PercentChange className="percent-change up text-right" width="33%">+19.33%</PercentChange>
              </LatestTick>
            )}

            {bids && (
              <List className="bp3-list-unstyled list list-buy" id="list-buy">
                {bids.map((order, index) => (
                  <BuyOrder key={index} index={index} order={order} />
                ))}
              </List>
            )}
          </ListContent>
        </OrderBookContent>
      </Wrapper>
    )
  }
}

export type SingleOrderProps = {
  order: Object,
  index: number
};

const BuyOrder = (props: SingleOrderProps) => {
  const { order } = props
  return (
    <Row>
      <BuyRowBackground amount={order.relativeTotal} />
      <Cell className="up" width="33%">{order.price}</Cell>
      <Cell className="text-right" width="34%">{order.amount}</Cell>
      <Cell className="text-right" width="33%">{order.total}</Cell> 
    </Row>
  )
}

const SellOrder = (props: SingleOrderProps) => {
  const { order, index } = props
  return (
    <Row key={index}>
      <SellRowBackGround amount={order.relativeTotal} />
      <Cell className="down" width="33%">{order.price}</Cell>
      <Cell className="text-right" width="34%">{order.amount}</Cell>
      <Cell className="text-right" width="33%">{order.total}</Cell>
    </Row>
  )
}

const Wrapper = styled.div`
  height: 100%;
`
const OrderBookHeader = styled.div``
const Title = styled.div``
const FilterList = styled.div``
const FilterSell = styled.div``
const FilterAll = styled.div``
const FilterBuy = styled.div``

const OrderBookContent = styled.div.attrs({})`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
`
const ListContainer = styled.div`
  width: 100%;
`
const List = styled.ul`
  overflow-y: auto;
`

const Row = styled.li.attrs({
  className: 'row',
})`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  position: relative;
  width: 100%;
  margin: 0px !important;
  padding: 3.5px 0 !important;

  &:hover {
    background-color: ${Colors.BLUE_MUTED};
    position: relative;
    border-radius: 3px;
    -webkit-box-shadow: inset 0 0 0 1px rgb(49, 64, 76),
      -1px 10px 4px rgba(16, 22, 26, 0.1), 1px 18px 24px rgba(16, 22, 26, 0.2);
    box-shadow: inset 0 0 0 1px rgb(49, 64, 76),
      -1px 5px 4px rgba(16, 22, 26, 0.1), 1px 7px 24px rgba(16, 22, 26, 0.2);
    z-index: 1;
  }
`

const SellRowBackGround = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: ${props => 100 * props.amount}% !important;
  background-color: ${Colors.SELL_MUTED} !important;
  z-index: 1;
`

const BuyRowBackground = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: ${props => 100 * props.amount}% !important;
  background-color: ${Colors.BUY_MUTED} !important;
  z-index: 1;
`

const Cell = styled.span`
  width: ${props => props.width? props.width : "35px"}
`

const ListHeading = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin: 0px;
`

const ListContent = styled.div``

const HeaderRow = styled.li`
  display: flex;
  justify-content: space-between;
  margin: 0px !important;
  padding-bottom: 10px;
  width: 100%;
`

const HeaderCell = styled.span`
  width: ${props => props.width? props.width : "35px"}
`

const LatestTick = styled.div``
const LatestPrice = styled.div`
  width: ${props => props.width? props.width : "70px"}
`
const CryptoPrice = styled.span``
const CashPrice = styled.span``
const PercentChange = styled.div`
  width: ${props => props.width? props.width : "35px"}
`

export default OrderBookRenderer
