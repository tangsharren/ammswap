import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import './WithdrawComponent.css';
import { Card, Button } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DragonSwap from '../../abis/DragonSwap.json'
import Web3 from 'web3';

export default function WithdrawComponent() {

    let [totaltoken1, settotaltoken1] = useState(0);
    let [totaltoken2, settotaltoken2] = useState(0);
    let [totalLPToken, settotalLPToken] = useState(0);
    let [poolLPToken, setpoolLPToken] = useState(0);
    let [token1Estimate, settoken1Estimate] = useState(0);
    let [token2Estimate, settoken2Estimate] = useState(0);

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
                    poolLPToken = setpoolLPToken(result[2])
                });

                dragonswap.methods.getProviderLPToken().call(function (error, result) {
                    totalLPToken = settotalLPToken(result);
                });
            }
        }
        getDataOnPageLoad()
    }, [])

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const handleToken1Change = async (e) => {

        const web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.requestAccounts();
        const networkId = await web3.eth.net.getId();
        const networkData = DragonSwap.networks[networkId]
        if (networkData) {

            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)
            var amount_token_1 = e.target.value;
            let totalLPToken = parseInt(document.getElementById("totalLPToken").value);
            console.log(totalLPToken);
            if (amount_token_1 > totalLPToken) {
                amount_token_1 = 0;
                alert("Entered amount must less than or equal to total LP Token of provider.");

            } else {
                dragonswap.methods.getWithdrawTokenEstimate(amount_token_1).call(function (error, result) {
                    token1Estimate = settoken1Estimate(result[0])
                    token2Estimate = settoken2Estimate(result[1])
                });
            }


        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }



    //load the metamask account and display on web page
    async function withdrawLiquidity() {
        const web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.requestAccounts()
        const networkId = await web3.eth.net.getId()
        const networkData = DragonSwap.networks[networkId]
        console.log(accounts);
        if (networkData) {
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)
            // Provide Liquidity
            var amount_token_1 = parseInt(document.getElementById("token1").value);
            let totalLPToken = parseInt(document.getElementById("totalLPToken").value);
            console.log(amount_token_1);
            if (amount_token_1 > 0 && amount_token_1 <= totalLPToken) {
                dragonswap.methods.withdraw(amount_token_1).send({ from: accounts[0] })
                    .then(function (receipt) {
                        console.log(receipt)
                        window.alert('Token withdraw successfully.')
                        window.location.reload()
                    });

            } else {
                window.alert('Please enter a valid amount.')
            }

        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }

    return (
        <div >
            {/* background-color: rgb(33, 36, 41) */}
            <Card className="mt-5">
                <Card.Header><h5>Withdraw Liquidity</h5></Card.Header>
                <Card.Body>
                    <Card.Title>
                        ETH/DRG Pool Token
                    </Card.Title>
                    <Card.Text>
                        <div className="pool-token">
                            <div className='label'>Your pool tokens:</div>
                            <div className="">{totalLPToken}</div>
                            <input type="hidden" value={totalLPToken} id="totalLPToken" />
                        </div>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1" style={{width: '22%'}}>LP Token(s)</InputGroup.Text>
                            <FormControl
                                type="text"
                                placeholder="Enter LP Token to withdraw..."
                                id="token1"
                                onChange={handleToken1Change}
                            />
                        </InputGroup>
                        <div className="token-get-back">
                            <div className="pool-token">
                                <div className='label'>Token you will get:</div>
                            </div>
                            <div className="pool-token">
                                <div className='label'>ETH :</div>
                                <div className="" >{token1Estimate}</div>
                            </div>
                            <div className="pool-token">
                                <div className='label'>DRG:</div>
                                <div className="" >{token2Estimate}</div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-around m-3">
                            <div className='info-card'>
                                <div><strong>Total ETH in pool</strong></div>
                                <div>{totaltoken1}</div>
                            </div>
                            <div className='info-card'>
                                <div><strong>Total DRG in pool</strong></div>
                                <div>{totaltoken2}</div>
                            </div>
                            <div className='info-card'>
                                <div><strong>Total LP Token in pool</strong></div>
                                <div>{poolLPToken}</div>
                            </div>
                        </div>

                    </Card.Text>
                    <Button className="withdraw-btn d-block mx-auto" onClick={withdrawLiquidity}>Withdraw</Button>
                </Card.Body>
            </Card>
        </div>
    );
}
