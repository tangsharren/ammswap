// App.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import XYKPoolABI from './ABI/XYKPoolABI.json';  
import FlareABI from './ABI/flareABI.json';  
import ZenixABI from './ABI/zenixABI.json';  

const xykPoolAbi = XYKPoolABI;  
const flareAbi = FlareABI;  
const zenixAbi = ZenixABI;  
const flareAddress = '0xaEc46307d54d362a8cE7aa9d9e114d5254873F63';
const zenixAddress = '0xBE718bc44fF3F793c3028d993f9e86b480D77023';
const xykPoolAddress = '0x29DD55a0175179b8Bc93d95AE233BC49B0897eA7';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [xykPoolContract, setXykPoolContract] = useState(null);
  const [flrContract, setFlrContract] = useState(null);
  const [znxContract, setZnxContract] = useState(null);
  const [flareFormattedBalance, setFlareBalance] = useState(0);
  const [zenixFormattedBalance, setZenixBalance] = useState(0);
  const [reserveFlare, setReserveFlare] = useState(0);
  const [reserveZenix, setReserveZenix] = useState(0);
  const [amountToAddFlare, setAmountToAddFlare] = useState("");
  const [amountToAddZenix, setAmountToAddZenix] = useState("");
  const [totalLiquidity, setTotalLiquidity] = useState(0);
  const [suggestedLiquidity, setSuggestedLiquidity] = useState(0);

  const loadBalances = async () => {
    if (flrContract && znxContract) {
      try {
        const flrContractInstance = new web3.eth.Contract(flareAbi, flareAddress);
        const znxContractInstance = new web3.eth.Contract(zenixAbi, zenixAddress);
        const flrDecimals = await flrContractInstance.methods.decimals().call();
        const znxDecimals = await znxContractInstance.methods.decimals().call();
  
        const flareBalance = await flrContractInstance.methods.balanceOf(accounts[0]).call();
        const zenixBalance = await znxContractInstance.methods.balanceOf(accounts[0]).call();
  
        const flareFormattedBalance = flareBalance / 10 ** flrDecimals;
        const zenixFormattedBalance = zenixBalance / 10 ** znxDecimals;
  
        setFlareBalance((prevBalance) => flareFormattedBalance);
        setZenixBalance((prevBalance) => zenixFormattedBalance);
  
        if (xykPoolContract) {
          const reserve1 = await xykPoolContract.methods.reserve1().call();
          const reserve2 = await xykPoolContract.methods.reserve2().call();
          setReserveFlare((prevReserve) => reserve1);
          setReserveZenix((prevReserve) => reserve2);
        }
      } catch (error) {
        console.error("Error loading balances:", error);
      }
    }
  };
  
  useEffect(() => {
    // Load balances when the page is reloaded
    loadBalances();
  }, []);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    initWeb3();
  }, []);

  


  useEffect(() => {
    const initializeContracts = async () => {
      if (web3) {
        try {
          const xykPoolContractInstance = new web3.eth.Contract(xykPoolAbi, xykPoolAddress);
          setXykPoolContract(xykPoolContractInstance);
  
          const flrContractInstance = new web3.eth.Contract(flareAbi, flareAddress);
          setFlrContract(flrContractInstance);
  
          const znxContractInstance = new web3.eth.Contract(zenixAbi, zenixAddress);
          setZnxContract(znxContractInstance);
         

          // Additional check for connected accounts
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);

          // Load balances when contracts are initialized
          loadBalances();
        } catch (error) {
          console.error("Error initializing contracts:", error);
        }
      }
    };
  
    initializeContracts();
  }, [web3]);

  
  useEffect(() => {
    const loadAccounts = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    };

    if (web3) {
      loadAccounts();
    }
  },  [web3]);

  const connectToMetaMask = async () => {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    } catch (error) {
      console.error('User denied account access');
    }
    loadBalances();
  };

  const addLiquidity = async () => {
  if (!flrContract || !znxContract || !xykPoolContract) {
    console.error("Contracts not initialized");
    return;
  }

  try {
    // Check if the connected account is the owner of the XYK contract
    const ownerAddress = await xykPoolContract.methods.owner().call();
    if (accounts[0] === ownerAddress) {
      console.error("Owner is forbidden from adding liquidity");
      // Display a pop-up message on the page (you might want to implement this)
      // Example: alert("Owner is forbidden from adding liquidity");
      return;
    }

    // Step 1: Approval
    // Metamask pop up window 
    // once for each token
    //To set the maximum spending
    await flrContract.methods
      .approve(xykPoolAddress, amountToAddFlare)
      .send({ from: accounts[0] });

    await znxContract.methods
      .approve(xykPoolAddress, amountToAddZenix)
      .send({ from: accounts[0] });

    // Step 2: Adding Liquidity
    const tx = await xykPoolContract.methods
      .addLiquidity(amountToAddFlare, amountToAddZenix)
      .send({ from: accounts[0] });

    // Calculate and set suggested liquidity based on the ratio
    const ratio = await xykPoolContract.methods.getRatio(flrContract.address, amountToAddFlare).call();
    const suggestedLiquidity = (amountToAddZenix * ratio) / 10 ** 18; // Adjust the division based on your token decimals
    setSuggestedLiquidity(suggestedLiquidity);
    console.log("Suggested Liquidity:", suggestedLiquidity);

    // Listen for events emitted by the XYKPool contract
    tx.events.ShareChanged &&
      setFlareBalance((prevBalance) => prevBalance + tx.events.ShareChanged.returnValues.userShareAmount);

    tx.events.LiquidityChanged &&
      setTotalLiquidity((prevLiquidity) => prevLiquidity + tx.events.LiquidityChanged.returnValues.newLiquidity);

    tx.events.ReserveChanged &&
      setReserveFlare((prevReserve) => prevReserve + tx.events.ReserveChanged.returnValues.newReserve);
    
    

    // You may want to update other balances and reserves after adding liquidity
    loadBalances();
  } catch (error) {
    console.error("Error adding liquidity:", error);
  }
};
const removeLiquidity = async () => {
  if (!flrContract || !znxContract || !xykPoolContract) {
    console.error("Contracts not initialized");
    return;
  }

  try {
    // Check if the connected account is the owner of the XYK contract
    const ownerAddress = await xykPoolContract.methods.owner().call();
    console.error(ownerAddress);
    if (accounts[0] === ownerAddress) {
      console.error("Owner is forbidden from removing liquidity");
      // Display a pop-up message on the page (you might want to implement this)
      // Example: alert("Owner is forbidden from removing liquidity");
      return;
    }



    //Removing Liquidity
    const tx = await xykPoolContract.methods
      .removeLiquidity()
      .send({ from: accounts[0] });

    // Listen for events emitted by the XYKPool contract
    tx.events.ShareChanged &&
      setFlareBalance((prevBalance) => prevBalance - tx.events.ShareChanged.returnValues.userShareAmount);

    tx.events.LiquidityChanged &&
      setTotalLiquidity((prevLiquidity) => prevLiquidity - tx.events.LiquidityChanged.returnValues.removedLiquidity);

    tx.events.ReserveChanged &&
      setReserveFlare((prevReserve) => prevReserve - tx.events.ReserveChanged.returnValues.removedReserve);

    // You may want to update other balances and reserves after removing liquidity
    loadBalances();
  } catch (error) {
    console.error("Error removing liquidity:", error);
  }
};
  

return (
  <div className="App">
    <h1>XYKPool DApp</h1>
    <p>Connected Account: {accounts.length > 0 ? accounts[0] : 'Not connected'}</p>
    <button onClick={connectToMetaMask}>Connect to MetaMask</button>

    <div>
      <h2>Token Balances</h2>
      <p>Flare Balance: {flareFormattedBalance} FLR</p>
      <p>Zenix Balance: {zenixFormattedBalance} ZNX</p>
    </div>

    <div>
      <h2>Add Liquidity</h2>
      <label>
        Amount of FLR to Add:
        <input
          type="text"
          value={amountToAddFlare}
          onChange={(e) => setAmountToAddFlare(e.target.value)}
        />
      </label>

      <label>
        Amount of ZNX to Add:
        <input
          type="text"
          value={amountToAddZenix}
          onChange={(e) => setAmountToAddZenix(e.target.value)}
        />
      </label>

      <button onClick={() => addLiquidity(amountToAddFlare, amountToAddZenix)}>
        Add Liquidity
      </button>

          {/* Display suggested liquidity */}
          {suggestedLiquidity > 0 && (
            <p>Suggested Liquidity: {suggestedLiquidity}</p>
        )}
    </div>

    <div>
      <h2>Remove Liquidity</h2>
      <button onClick={removeLiquidity}>
        Remove Liquidity
      </button>
    </div>

    <div>
      <h2>Liquidity Pool</h2>
      {xykPoolContract && (
        <>
          <p>Reserve Flare: {reserveFlare} Flare</p>
          <p>Reserve Zenix: {reserveZenix} Zenix</p>
        </>
      )}
    </div>
  </div>
);
      }
export default App;
