import React, { useState, useEffect } from 'react';
import Logo from '../../images/dragon_swap.png';
import 'bootstrap/dist/css/bootstrap.min.css'
import './Header.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Button, Card } from "react-bootstrap";
import { ethers } from "ethers";
import Web3 from "web3";


export default function Header() {
    // usetstate for storing and retrieving wallet details
    const [data, setdata] = useState({
        address: "",
        Balance: null,
    });

    // Button handler button for handling a
    // request event for metamask
    async function btnhandler(e) {

        // Asking if metamask is already present or not
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            // res[0] for fetching a first wallet
            await window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((res) => accountChangeHandler(res[0]));
            localStorage.setItem('isWalletConnected', true);

            document.getElementById("btn-connect").style.display = "none";
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            alert("install metamask extension!!");
        }
    };

    // getbalance function for getting a balance in
    // a right format with help of ethers
    const getbalance = (address) => {
        // Requesting balance method
        window.ethereum
            .request({
                method: "eth_getBalance",
                params: [address, "latest"]
            })
            .then((balance) => {
                // Setting balance
                setdata({
                    Balance: ethers.utils.formatEther(balance),
                });
            });
    };

    // Function for getting handling all events
    const accountChangeHandler = (account) => {
        // Setting an address data
        setdata({
            address: account,
        });

        // Set the account address 
        document.getElementById("address").innerHTML = account;

        // Setting a balance
        getbalance(account);
    };

    useEffect(() => {
        const connectWalletOnPageLoad = async () => {
            if (localStorage?.getItem('isWalletConnected') === 'true') {
                try {
                    await window.ethereum
                        .request({ method: "eth_requestAccounts" })
                        .then((res) => accountChangeHandler(res[0]));
                    localStorage.setItem('isWalletConnected', true);

                    document.getElementById("btn-connect").style.display = "none";
                } catch (ex) {
                    console.log(ex)
                }
            }
        }
        connectWalletOnPageLoad()
    }, [])

    return (
        <header>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="nav-container">
                <div className="logo-container" >
                    <img src={Logo} className="logo-img" />
                </div>
                <Navbar.Brand href="#home">Dragonswap</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/">Pool</Nav.Link>
                        <Nav.Link href="/swap">Swap</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Button onClick={btnhandler} id="btn-connect">
                    Connect Wallet
                </Button>

                <div id="address" className="text-white p-3"></div>
            </Navbar>
        </header>);
}
