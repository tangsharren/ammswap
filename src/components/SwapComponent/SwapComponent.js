import React, { useContext, useState, useEffect } from 'react';
import { RiSettings3Fill } from 'react-icons/ri';
import ethLogo from '../../images/eth.jpeg';
import Header from '../Header/Header.js';
import '../SwapComponent/SwapComponent.css';
import DragonSwap from '../../abis/DragonSwap.json'
import Web3 from 'web3';
import Logo from '../../images/dragon_swap.png';

export default function SwapComponent() {


    useEffect(() => {
        document.getElementById('swapToken2').style.display = "none";
        document.getElementById('swapToken1').style.display = "block";
    }, [])

    const handleToken1Change = async (e) => {
        document.getElementById('swapToken2').style.display = "none";
        document.getElementById('swapToken1').style.display = "block";
        const web3 = new Web3(window.web3.currentProvider);
        const networkId = await web3.eth.net.getId()
        const accounts = await web3.eth.requestAccounts()
        const networkData = DragonSwap.networks[networkId]
        if (networkData) {
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)

            var amount_token_1 = parseInt(document.getElementById("token1").value);
            dragonswap.methods.getSwapToken1Estimate(amount_token_1).call(function (error, result) {
                console.log(result)
                document.getElementById('token2').value = result
            });

        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }

    const handleToken2Change = async (e) => {
        document.getElementById('swapToken1').style.display = "none";
        document.getElementById('swapToken2').style.display = "block";
        const web3 = new Web3(window.web3.currentProvider);
        const networkId = await web3.eth.net.getId()
        const accounts = await web3.eth.requestAccounts()
        const networkData = DragonSwap.networks[networkId]
        if (networkData) {
            console.log(networkData)
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)

            var amount_token_2 = parseInt(document.getElementById("token2").value);
            dragonswap.methods.getSwapToken2Estimate(amount_token_2).call(function (error, result) {
                // console.log(result)
                document.getElementById('token1').value = result
            });

        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }

    async function confirmSwapToken2() {
        const web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.requestAccounts()
        const networkId = await web3.eth.net.getId()
        const networkData = DragonSwap.networks[networkId]

        if (networkData) {
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)

            var amount_token_2 = parseInt(document.getElementById("token2").value);
            if (amount_token_2 <= 0) {
                alert('The amount of token DRG must exceed 0')
            } else {
                dragonswap.methods.swapToken2(amount_token_2).send({ from: accounts[0] })
                    .then(function (receipt) {
                        console.log(receipt)
                        alert('Swap successfully')
                    });
            }
        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }

    async function confirmSwapToken1() {
        const web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.requestAccounts()
        const networkId = await web3.eth.net.getId()
        const networkData = DragonSwap.networks[networkId]

        if (networkData) {
            const dragonswap = new web3.eth.Contract(DragonSwap.abi, networkData.address)
            var amount_token_1 = parseInt(document.getElementById("token1").value);
            if (amount_token_1 <= 0) {
                alert('The amount of token ETH must exceed 0')
            } else {
                dragonswap.methods.swapToken1(amount_token_1).send({ from: accounts[0] })
                    .then(function (receipt) {
                        console.log(receipt)
                        alert('Swap successfully')
                    });
            }
        } else {
            window.alert('DragonSwap contract not deployed to detected network')
        }
    }
    return (
        <div style={{ height: "100vh", background: "#F8F8F8" }}>
            <Header />
            <div className="wrapper">
                <div className="content">
                    <div className="formHeader">
                        <div>Swap</div>
                        <div>
                            <RiSettings3Fill />
                        </div>
                    </div>
                    <div className="transferPropContainer">
                        <input
                            type='number'
                            className="transferPropInput"
                            placeholder='Enter amount of ETH...'
                            pattern='^[0-9][.,]?[0-9]$'
                            style={{ textIndent: '10px' }}
                            id="token1"
                            onChange={handleToken1Change}
                        />
                        <div className="currencySelector">
                            <div className="currencySelectorContent">
                                <div className="currencySelectorIcon">
                                    <img className="ethLogo" src={ethLogo} alt='eth logo' />
                                </div>
                                <div className="currencySelectorTicker">ETH</div>
                            </div>
                        </div>
                    </div>
                    <div className="transferPropContainer">
                        <input
                            type='number'
                            className="transferPropInput"
                            placeholder='Enter amount of DRG ...'
                            style={{ textIndent: '10px' }}
                            onChange={handleToken2Change}
                            id="token2"
                        />
                        <div className="currencySelector">
                            <div className="currencySelectorContent">
                                <div className="currencySelectorIcon">
                                    <img className="ethLogo" src={Logo} alt='eth logo' />
                                </div>
                                <div className="currencySelectorTicker">DRG</div>
                            </div>
                        </div>
                    </div>
                    <div className="confirmButton" style={{ textAlign: 'center' }} id="swapToken1" onClick={confirmSwapToken1}>
                        Confirm Swap Token 1
                    </div>
                    <div className="confirmButton" style={{ textAlign: 'center' }} id="swapToken2" onClick={confirmSwapToken2}>
                        Confirm Swap Token 2
                    </div>
                </div>
            </div>
        </div>
    );
}