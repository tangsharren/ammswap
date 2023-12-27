import React, { useState, useEffect } from 'react';
import './ProvideComponent.css';
import { Card, Button } from 'react-bootstrap';
import DragonSwap from '../../abis/DragonSwap.json'
import Web3 from 'web3';

export default function ProvideComponent() {
    let [LPTokenReturned, setLPTokenReturned] = useState('[to be calculate]');
    let [totaltoken1, settotaltoken1] = useState(0);
    let [totaltoken2, settotaltoken2] = useState(0);
    let [totalLPToken, settotalLPToken] = useState(0);
    let [token1balances, settoken1balances] = useState(0);
    let [token2balances, settoken2balances] = useState(0);
    let [LPToken, setLPToken] = useState(0);

    useEffect(() => {
        const getDataOnPageLoad = async () => {
            const web3 = new Web3(window.web3.currentProvider);
            const accounts = await web3.eth.requestAccounts()
            const networkId = await web3.eth.net.getId()
            const networkData = DragonSwap.networks[networkId]

            if (networkData) {
                const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)
                // Check total token1 and token2 in pool
                dragonswap.methods.getPoolDetails().call(function (error, result) {
                    totaltoken1 = settotaltoken1(result[0])
                    totaltoken2 = settotaltoken2(result[1])
                    totalLPToken = settotalLPToken(result[2]);
                });

                // Check total token1 and token2 in pool
                dragonswap.methods.checkMyBalances().call(function (error, result) {
                    token1balances = settoken1balances(result[0])
                    token2balances = settoken2balances(result[1])
                    LPToken = setLPToken(result[2])
                });

            }
        }
        getDataOnPageLoad()
    }, [])

    //load the metamask account and display on web page
    async function addLiquidity() {
        const web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.requestAccounts()
        const networkId = await web3.eth.net.getId()
        const networkData = DragonSwap.networks[networkId]

        if (networkData) {
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)

            // Provide Liquidity
            var amount_token_1 = parseInt(document.getElementById("token1").value);
            var amount_token_2 = parseInt(document.getElementById("token2").value);

            if (amount_token_1 <= 0 || amount_token_2 <= 0 || Number.isNaN(amount_token_1) || Number.isNaN(amount_token_2)) {
                alert('Please ensure ETH input field and DRG input is not empty or 0')
            } else {
                dragonswap.methods.LPToken(amount_token_1, amount_token_2).call(function (error, result) {
                    LPTokenReturned = setLPTokenReturned(result);
                    document.getElementById('lptoken').style.fontWeight = '700'
                    document.getElementById('lptoken').style.fontStyle = 'normal'
                });

                dragonswap.methods.provideLiquidity(amount_token_1, amount_token_2).send({ from: accounts[0] })
                    .then(function (receipt) {
                        // console.log(receipt)
                        window.location.reload()
                        alert('Liquidity added successfully')
                    });
            }
        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }

    return (
        <div>
            <Card className="mt-5 card-provide">
                <Card.Header><div className="title">Provide Liquidity</div></Card.Header>
                <Card.Body>
                    <div><strong>ETH/DRG Liquidity Pool Details</strong></div>
                    <div className="d-flex justify-content-around m-3">
                        <div className='info-card'>
                            <div><strong>Total ETH</strong></div>
                            <div>{totaltoken1}</div>
                        </div>
                        <div className='info-card'>
                            <div><strong>Total DRG</strong></div>
                            <div>{totaltoken2}</div>
                        </div>
                        <div className='info-card'>
                            <div><strong>Total LP token</strong></div>
                            <div>{totalLPToken}</div>
                        </div>
                    </div>
                    <Card.Text>
                        <div className='mb-2'><strong>Your Holdings</strong></div>
                        <div className="d-flex justify-content-around m-3">
                        <div className='info-card'>
                            <div><strong>ETH token balance</strong></div>
                            <div>{token1balances}</div>
                        </div>
                        <div className='info-card'>
                            <div><strong>DRG token balance</strong></div>
                            <div>{token2balances}</div>
                        </div>
                        <div className='info-card'>
                            <div><strong>LP Token(s) owned</strong></div>
                            <div>{LPToken}</div>
                        </div>
                    </div>
                        <div className='mb-2'><strong>Provide your liquidity here</strong></div>
                        <div className="input-field d-flex pb-2">
                            <div className='w-25'>ETH</div>
                            <div className='w-75'>
                                <input type="number" placeholder="Enter amount of ETH ..." name="token1" min="1" id="token1" style={{ width: "100%" }} />
                            </div>
                        </div>
                        <div className="input-field d-flex pb-2">
                            <div className='w-25'>DRG</div>
                            <div className='w-75'>
                                <input type="number" placeholder="Enter amount of DRG ..." name="token2" min="1" id="token2" style={{ width: "100%" }} />
                            </div>
                        </div>
                        <div className="token-card input-field d-flex pb-2">
                            Amount of LP Token will be assigned to you : <span style={{ marginLeft: '15px', fontStyle: 'italic' }} id="lptoken">{LPTokenReturned}</span>
                        </div>
                    </Card.Text>
                    <Button variant="warning" className="add-liquidity-button d-block mx-auto" onClick={addLiquidity}>Provide</Button>
                </Card.Body>
            </Card>
        </div>
    );
}
