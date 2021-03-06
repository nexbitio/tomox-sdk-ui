import React, { useState } from 'react'
import styled from 'styled-components'
import {
    Icon,
    Tabs,
    Tab,
    Drawer,
    Position,
    InputGroup,
  } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'
import BigNumber from 'bignumber.js'

import { TOMOSCAN_URL } from '../../../config/environment'
import { lendingAmountPrecision } from '../../../config/tokens'
import { Link, Theme, TmColors, ButtonGroup, AcceptButton, Highlight } from '../../Common'
import { formatDate } from '../../../utils/helpers'

const TRADE_STATUS = {
    'OPEN': <FormattedMessage id='exchangePage.open' />,
    'CLOSED': <FormattedMessage id='exchangeLendingPage.orders.trade.closed' />,
    'LIQUIDATED': <FormattedMessage id='exchangeLendingPage.orders.trade.liquidated' />,
}

const ORDERTYPES = {
    'LO': <FormattedMessage id='exchangePage.limit' />,
    'MO': <FormattedMessage id='exchangePage.market' />,
}

const TOPUPTYPES = {
    '0': 'Manual',
    '1': 'Auto',
}

export default function DetailsDrawer({
    item, 
    actions, 
    onClose, 
    renderSideIcon,
    topUpAmount,
    onChangeAmount,
    onTopUp,
    errorTopUp,
    selectAllAvailableBalance,
    lendingToken,
    realInterest,
    totalRepay,
    errorRepay,
    handleRepay,
}) {    
    const [selectedTabId, setSelectedTabId] = useState('topup')

    const handleTabChange = (tabId) => {
        setSelectedTabId(tabId)
    }

    return (
        <Drawer
            title="Details"
            onClose={onClose}
            autoFocus={true}
            canOutsideClickClose={true}
            hasBackdrop={true}
            isOpen={!!item}
            position={Position.RIGHT}
            size="70%"
            usePortal={false}
        >
            {item && (
                <Container>
                    <Main>
                        <Info item={item} renderSideIcon={renderSideIcon} />

                        {(item.side.toUpperCase() === 'BORROW') && actions && (
                            <>
                                <Divider />
                                <Tabs onChange={handleTabChange} selectedTabId={selectedTabId}>
                                    <Tab 
                                        id="topup" 
                                        title="TopUp" 
                                        panel={<TopUp 
                                                    item={item} 
                                                    topUpAmount={topUpAmount} 
                                                    onChangeAmount={onChangeAmount}
                                                    onTopUp={onTopUp}
                                                    error={errorTopUp}
                                                    selectAllAvailableBalance={selectAllAvailableBalance}
                                                />} 
                                    />
                                    <Tab 
                                        id="repay" 
                                        title="Repay" 
                                        panel={<Repay 
                                                item={item} 
                                                lendingToken={lendingToken}
                                                realInterest={realInterest}
                                                totalRepay={totalRepay}
                                                errorRepay={errorRepay}
                                                onRepay={handleRepay}
                                            />} 
                                    />
                                </Tabs>
                            </>
                        )}
                    </Main>

                    <ButtonLink href={`${TOMOSCAN_URL}/lending/trades/${item.hash}`} target="_blank">
                        View on TomoScan <Icon iconSize='10px' icon="document-share" />
                    </ButtonLink>
                </Container>
            )}
        </Drawer>
    )
}

function Info({item, renderSideIcon}) {
    return (
        <Wrapper>
            <Header>
                <span>{renderSideIcon(item.side)}{`${item.termSymbol}/${item.lendingTokenSymbol}`}</span>
                <Value>{BigNumber(item.interest).toFormat(2)}&#37;</Value>
            </Header>
            <Row>
                <Label><FormattedMessage id="exchangeLendingPage.orders.openDate" /></Label>
                <Value>{formatDate(item.time, 'LL-dd HH:mm:ss')}</Value>
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangeLendingPage.orders.closeDate" /></Label> 
                {(item.status.toUpperCase() === "OPEN") && 
                    (<Value>{formatDate(Number(item.liquidationTime)*1000, 'LL-dd HH:mm:ss')}</Value>)
                }
                {(item.status.toUpperCase() !== "OPEN") && 
                    (<Value>{formatDate(item.updatedAt, 'LL-dd HH:mm:ss')}</Value>)
                }
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangePage.type" /></Label>
                <Value>{ORDERTYPES[item.type]}-{TOPUPTYPES[item.autoTopUp]}</Value>
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangePage.amount" /></Label> 
                <Value>{BigNumber(item.amount).toFormat()} {item.lendingTokenSymbol}</Value>
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangeLendingPage.orders.collateral" /></Label> 
                <Value>{BigNumber(item.collateralLockedAmount).toFormat()} {item.collateralTokenSymbol}</Value>
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangeLendingPage.orders.liqPrice" /></Label> 
                <Value>
                {BigNumber(item.liquidationPrice).toFormat(item.liquidationPricePrecision)}&nbsp;
                {`${item.collateralTokenSymbol}/${item.lendingTokenSymbol}`}
                </Value>
            </Row>
            <Row>
                <Label><FormattedMessage id="exchangePage.status" /></Label>
                <Value>{TRADE_STATUS[item.status]}</Value>
            </Row>
        </Wrapper>
    )
}

function TopUp({item, onTopUp, onChangeAmount, topUpAmount, selectAllAvailableBalance, error }) {
    
    return (
        <>
            <ActionBody>
                <Label>Amount</Label>
                <StyledInputGroup
                    error={error ? 1 : 0}
                    name="amount-collateral"
                    type="number"
                    onChange={e => onChangeAmount(e)}
                    value={topUpAmount}
                    autoComplete="off"
                    rightElement={<CollateralSymbol>{item.collateral && item.collateral.symbol}</CollateralSymbol>}
                />
                <Error color={TmColors.RED}>{error && error.message}</Error>
                <div>
                    <div>Avbl</div>
                    <Value onClick={selectAllAvailableBalance}>
                        {item.collateral && BigNumber(item.collateral.availableBalance).toFormat(8)} {item.collateral && item.collateral.symbol}
                    </Value>
                </div>
            </ActionBody>

            <ButtonGroup>
                <AcceptButton
                    width="100%"
                    text="Top Up"
                    onClick={() => onTopUp(item.hash)} 
                />
            </ButtonGroup>
        </>
    )
}

function Repay({item, onRepay, lendingToken, realInterest, totalRepay, errorRepay}) {
    return (
        <>
            <ActionBody>
                <Typo>Loan: 
                    <span>
                        <Value>{BigNumber(item.amount).toFormat(lendingAmountPrecision)}</Value> {lendingToken.symbol}
                    </span>
                </Typo>
                <Typo>Interest: 
                    <span>
                        <Value>{BigNumber(realInterest).toFormat(lendingAmountPrecision)}</Value> {lendingToken.symbol}
                    </span>
                </Typo>
                <Typo>Total repay: 
                    <Highlight>
                        {BigNumber(totalRepay).toFormat(lendingAmountPrecision)} {lendingToken.symbol}
                    </Highlight>
                </Typo>
                <Typo>Avbl: 
                    <span>
                        <Value>{BigNumber(lendingToken.availableBalance).toFormat(lendingAmountPrecision)}</Value> {lendingToken.symbol}
                    </span>
                </Typo>
                {errorRepay && (<Highlight color={TmColors.RED}>Your balance, not enough</Highlight>)}
            </ActionBody>

            <ButtonGroup>
                <AcceptButton 
                    width="100%"
                    onClick={onRepay} 
                    text="Yes, I want to repay" 
                />
            </ButtonGroup>
        </>
    )
}

const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 2;

  .bp3-tab-list {
    margin: 0 !important;
    padding: 0 !important;
  }
`

const Main = styled.div``

const Wrapper = styled.div``

const Divider = styled.div`
    border-top: 1px solid #2d3650;
    margin: 20px 0 10px;
`

const Header = styled.div`
  color: #fff;
  font-size: ${Theme.FONT_SIZE_MD};
  margin-bottom: 5px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

const Label = styled.span``

const Value = styled.span`
  color: #9ca4ba;
  font-size: ${Theme.FONT_SIZE_SM};
`

const ButtonLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${TmColors.ORANGE};
    border-radius: 3px;
    padding: 7px 0;
    margin-bottom: 15px;

    .bp3-icon {
        margin-left: 5px;
    }
`

export const StyledInputGroup = styled(InputGroup).attrs({
    className: props => props.error ? 'bp3-fill has-error' : 'bp3-fill',
})`
    &.has-error .bp3-input {
        box-shadow: 0 0 0 1px ${TmColors.RED};
    }

    .bp3-input {
        height: unset;
        font-family: 'Ubuntu', sans-serif;
        font-size: ${Theme.FONT_SIZE_SM};
        color: #fff;
        background-color: #2d3650;

        &:focus {
            box-shadow: 0 0 0 1px ${TmColors.ORANGE} !important;
        }
    }

    .bp3-input-action {
        top: 50% !important;
        transform: translateY(-50%);
    }

    .bp3-button {
        width: 40% !important;
    }
`

const ActionBody = styled.div`
    margin-top: 5px;
    margin-bottom: 25px;
`

const Typo = styled.p`
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
`

const CollateralSymbol = styled.span`
    padding: 0 5px;
`

const Error = styled.div`
    color: ${TmColors.RED};
    font-size: 10px;
    margin: 3px 0 7px;
`