// @flow
import React from 'react'
import {
  Tabs,
  Tab,
  InputGroup,
  Classes,
} from '@blueprintjs/core'
import { injectIntl, FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'

import {
  Theme,
  OverlaySpinner,
  TmColors,
  UtilityIcon,
  Centered,
  Text,
} from '../Common'
import styled from 'styled-components'
import { AutoSizer, List } from 'react-virtualized'
import { getChangePercentText } from '../../utils/helpers'
import { pricePrecision as defaultPricePrecision } from '../../config/tokens'

type Token = {
  pair: string,
  lastPrice: string,
  change: string,
  high: string,
  low: string,
  volume: string,
  base: string,
  quote: string,
  favorited: boolean
}

type Props = {
  loading: boolean,
  filteredPairs: any,
  selectedTabId: string,
  baseTokenBalance: number,
  quoteTokenBalance: number,
  searchFilter: string,
  selectedPair: Token,
  filterName: string,
  sortOrder: string,
  quoteTokens: Array<string>,
  onChangeSortOrder: string => void,
  changeTab: string => void,
  updateFavorite: (string, boolean) => void,
  onChangeSearchFilter: (SyntheticInputEvent<>) => void,
  onChangeFilterName: (SyntheticInputEvent<>) => void,
  changeSelectedToken: Token => void,
}

const TokenSearchRenderer = (props: Props) => {
  const {
    loading,
    filteredPairs,
    quoteTokens,
    selectedTabId,
    searchFilter,
    selectedPair,
    sortOrder,
    filterName,
    updateFavorite,
    onChangeFilterName,
    onChangeSearchFilter,
    showSearchResult,
    hideSearchResult,
    isShowSearchResult,
    onChangeSortOrder,
    changeTab,
    changeSelectedToken,
    intl,
  } = props

  return (
    <TokenSearchCard>
      {loading ? 
        (<OverlaySpinner visible={true} transparent={true} />) 
        : (
          <React.Fragment>
            <SearchInputBox>
              <InputGroup
                leftIcon="search"
                onChange={onChangeSearchFilter}
                onFocus={showSearchResult}
                onBlur={hideSearchResult}
                value={searchFilter}
                placeholder={intl.formatMessage({id: "marketsPage.search"})}
              />
            </SearchInputBox>

            {isShowSearchResult 
            && (
              <SearchResult 
                items={filteredPairs.searchResult}
                changeSelectedToken={changeSelectedToken} />)}
            
            <TokenSearchTabs selectedTabId={selectedTabId} onChange={changeTab}>
              <Tab
                id="star"
                title={<UtilityIcon 
                          name="Favorite"
                          color={selectedTabId === "star" ? TmColors.ORANGE : ''}
                          width={12}
                          height={12} />}
                panel={
                  <Panel
                    tokenPairs={filteredPairs.favorites}
                    filterName={filterName}
                    sortOrder={sortOrder}
                    searchFilter={searchFilter}
                    selectedTabId={selectedTabId}
                    selectedPair={selectedPair}
                    changeSelectedToken={changeSelectedToken}
                    updateFavorite={updateFavorite}
                    onChangeSearchFilter={onChangeSearchFilter}
                    onChangeFilterName={onChangeFilterName}
                    onChangeSortOrder={onChangeSortOrder}
                  />
                }
              />
              {quoteTokens.map((quote, index) => (
                <Tab
                  id={quote}
                  key={index}
                  title={quote}
                  panel={
                    <Panel
                      tokenPairs={filteredPairs[quote]}
                      filterName={filterName}
                      sortOrder={sortOrder}
                      searchFilter={searchFilter}
                      selectedTabId={selectedTabId}
                      selectedPair={selectedPair}
                      filteredPairs={filteredPairs}
                      changeSelectedToken={changeSelectedToken}
                      updateFavorite={updateFavorite}
                      onChangeSearchFilter={onChangeSearchFilter}
                      onChangeFilterName={onChangeFilterName}
                      onChangeSortOrder={onChangeSortOrder}
                    />
                  }
                />
              ))}
            </TokenSearchTabs>
          </React.Fragment>
        )}      
    </TokenSearchCard>
  )
}

const noRowsRenderer = () => {
  return (
    <Centered my={4}>
      <UtilityIcon name="not-found" width={32} height={32} />
      <Text color={TmColors.GRAY}><FormattedMessage id="portfolioPage.notFound" />.</Text>
    </Centered>
  )
}

const SearchResult = ({ items, changeSelectedToken }) => {
  function rowRenderer ({ key, index, style }) {
    return (
      <SearchResultItem
        key={key}
        style={style}
        className={Classes.POPOVER_DISMISS}
        onClick={() => changeSelectedToken(items[index])}
      >
        {items[index].pair}
      </SearchResultItem>
    )
  }
  
  return (
    <SearchResultBox>
      <AutoSizer>
        {({height, width}) => (
          <List
            height={height}
            rowCount={items.length}
            rowHeight={30}
            rowRenderer={rowRenderer}
            noRowsRenderer={noRowsRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    </SearchResultBox>
  )
}

type PanelProps = {
  filterName: string,
  sortOrder: string,
  searchFilter: string,
  selectedTabId: string,
  selectedPair: Token,
  tokenPairs: Array<Token>,
  changeSelectedToken: Token => void,
  updateFavorite: (string, boolean) => void,
  onChangeSearchFilter: (SyntheticInputEvent<>) => void,
  onChangeFilterName: (SyntheticInputEvent<>) => void,
  onChangeSortOrder: string => void
};

const Panel = (props: PanelProps) => {
  const {
    filterName,
    tokenPairs,
    sortOrder,
    selectedTabId,
    updateFavorite,
    onChangeFilterName,
    changeSelectedToken,
  } = props
  const isFavoriteTokensList = selectedTabId === 'star'

  return (
    <TokenSearchPanelBox>
      <TableHeader
        onChangeFilterName={onChangeFilterName}
        isFavoriteTokensList={isFavoriteTokensList}
        filterName={filterName}
        sortOrder={sortOrder}
      />
      <TableBody>
        {tokenPairs.map((token, index) => (
          <TokenRow
            key={index}
            index={index}
            token={token}
            selectedTabId={selectedTabId}
            isFavoriteTokensList={isFavoriteTokensList}
            updateFavorite={updateFavorite}
            changeSelectedToken={changeSelectedToken}
          />
        ))}
        {tokenPairs.length === 0 && <NoTokens>No Tokens to show</NoTokens>}
      </TableBody>
    </TokenSearchPanelBox>
  )
}

type TokenRowProps = {
  index: number,
  token: Token,
  isFavoriteTokensList: boolean,
  updateFavorite: (string, boolean) => void,
  changeSelectedToken: Object => void
};

const TokenRow = ({
  index,
  token,
  updateFavorite,
  isFavoriteTokensList,
  changeSelectedToken,
}: TokenRowProps) => {
  const { favorited, lastPrice, change, pair } = token
  let pricePrecision = token.pricePrecision ? token.pricePrecision : defaultPricePrecision

  return (
    <Row>
      <Cell width="10%" onClick={() => updateFavorite(pair, !favorited)}>
        <UtilityIcon name={favorited ? "FavoriteSolid" : "Favorite"} width={12} height={12} />
      </Cell>
      <Cell width="30%" className={Classes.POPOVER_DISMISS} onClick={() => changeSelectedToken(token)}>
        {pair}
      </Cell>
      <Cell width="35%" className={Classes.POPOVER_DISMISS} onClick={() => changeSelectedToken(token)}>
        {BigNumber(lastPrice).toFormat(pricePrecision)}
      </Cell>
      <Change24H width="25%" change={change} className={Classes.POPOVER_DISMISS} onClick={() => changeSelectedToken(token)}>
        {change !== null ? getChangePercentText(change) : "N.A"}
      </Change24H>
    </Row>
  )
}

type HeaderProps = {
  onChangeFilterName: (SyntheticInputEvent<>) => void,
  filterName: string,
  sortOrder: string,
  isFavoriteTokensList: boolean
};

const TableHeader = ({
  onChangeFilterName,
  filterName,
  sortOrder,
  isFavoriteTokensList,
}: HeaderProps) => {
  return (
    <HeaderRow>
      <Cell width="10%">&nbsp;</Cell>
      <Cell width="30%" onClick={() => onChangeFilterName('pair')}>
        <CellTitle><FormattedMessage id="marketsPage.pair" /></CellTitle>
        {filterName === 'pair' && (
          <UtilityIcon name={sortOrder === "asc" ? "arrow-up" : "arrow-down"} />
        )}
      </Cell>
      <Cell width="35%" onClick={() => onChangeFilterName('lastPrice')}>
        <CellTitle><FormattedMessage id="priceBoard.lastPrice" /></CellTitle>
        {filterName === 'lastPrice' && (
          <UtilityIcon name={sortOrder === "asc" ? "arrow-up" : "arrow-down"} />
        )}
      </Cell>
      <Cell width="25%" onClick={() => onChangeFilterName('change')}>
        <CellTitle><FormattedMessage id="priceBoard.24hChange" /></CellTitle>
        {filterName === 'change' && (
          <UtilityIcon name={sortOrder === "asc" ? "arrow-up" : "arrow-down"} />
        )}
      </Cell>
    </HeaderRow>
  )
}

const TokenSearchCard = styled.div`
  position: relative;
  background: ${props => props.theme.tokenSearcherBg};
  width: 550px;
  height: 300px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.menuColor}};
  box-shadow: 0 10px 10px 0 rgba(0, 0, 0, .5);

  .bp3-tab {
    color: ${props => props.theme.menuColor};
  }

  .bp3-tab:hover,
  .bp3-tab[aria-selected="true"] {
    color: ${props => props.theme.menuColorHover} !important;
  }

  .bp3-tab-list {
    padding: 10px;
    border-bottom: 1px solid ${props => props.theme.border};
  }

  @media only screen and (max-width: 680px) {
    .tomo-wallet & {
      width: 100%;
      height: 100%;
      box-shadow: unset;
      border: unset;

      .bp3-tab {
        font-size: ${Theme.FONT_SIZE_SM};
      }
    }
  }
`

const Row = styled.div.attrs({
  className: 'row',
})`
  display: flex;
  width: 100%;
  height: 35px;
  cursor: pointer;
  padding: 0 10px;

  &:hover {
    background: ${props => props.theme.menuBgHover};
  }
`

const Cell = styled.div`
  width: ${({width}) => width || '15%'};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({align}) => align || 'flex-start'}
  flex-grow: ${({flexGrow}) => flexGrow || 0}
  @media only screen and (max-width: 680px) {
    .tomo-wallet & {
      font-size: ${Theme.FONT_SIZE_SM};
    }
  }
`

const CellTitle = styled.span`
  margin-right: 5px;
`

const TokenSearchTabs = styled(Tabs)`
  height: 100%;
  .bp3-tab-panel {
    height: calc(100% - 51px);
    overflow: auto;
  }
  @media only screen and (max-width: 680px) {
    .tomo-wallet & {
      .bp3-tab-panel {
        height: unset;
        overflow: auto;
      }
    }
  }
`

const TokenSearchPanelBox = styled.div`
  height: 100%;
  overflow: hidden;
`

const SearchInputBox = styled.div`
  width: 150px;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 5;

  .bp3-input {
    background: ${props => props.theme.tokenSearcherSearchBg};
    color: ${props => props.theme.tokenSearcherSearchColor};
    &::placeholder {
      color: ${props => props.theme.tokenSearcherSearchColor};
    }
  }

  @media only screen and (max-width: 680px) {
    .tomo-wallet & {
      position: unset;
      width: unset;
      margin: 0 10px;
    }
  }
`

const HeaderRow = styled(Row)`
  font-size: ${Theme.FONT_SIZE_SM};
  border-bottom: 1px solid ${props => props.theme.border};
  &:hover {
    background: initial;
  }
`

const Change24H = styled(Cell)`
  color: ${props =>
    props.change > 0 ? TmColors.GREEN : TmColors.RED} !important;
`

const NoTokens = styled.div`
  margin-top: 30px;
  text-align: center;
`

const SearchResultBox = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  z-index: 1000;
  min-height: 200px;
  width: 150px;
  box-shadow: 0 10px 10px 0 rgba(0, 0, 0, .5);
  background-color: ${props => props.theme.tokenSearcherSearchResultBg};

  .ReactVirtualized__List {    
    background-color: ${props => props.theme.tokenSearcherSearchResultBg};
  }

  @media only screen and (max-width: 680px) {
    .tomo-wallet & {
      width: calc(100% - 20px);
      left: 10px;
    }
  }
`

const SearchResultItem = styled.div`
  padding: 0 10px;
  cursor: pointer;
  line-height: 30px;

  &:hover {
    background-color: ${props => props.theme.tokenSearcherSearchResultItemHover};
  }
`

const TableBody = styled.div`
  height: calc(100% - 35px);
  overflow-y: auto;
`

export default injectIntl(TokenSearchRenderer)


