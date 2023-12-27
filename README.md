## Basic AMM DeX - DragonSwap

### Prerequisite
1. Open cmd.exe
> C:\Users\zixua>node -v <br/> v16.13.2 <br/><br/> C:\Users\zixua>truffle --version <br/> Truffle v5.4.30 - a development framework for Ethereum
2. Ethereym wallet from Metamask
3. Ganache 2.5.4 

### How to run
1. Install this project by using `https://github.com/loozixuan/DragonSwap.git`
2. Open project using IDE such as `Visual Studio`
3. In `truffle-config.js`, the contract deployment using Ganache already been set up
4. Open Ganache and create a new workspace for this project
5. Select `NEW WORKSPACE` and enter workspace name as `DragonSwap`
6. Click `ADD PROJECT`, select the `truffle-config.js` under this project
7. After finish set up, click `SAVE WORKSPACE`
8. Back to visual studio, open terminal and run `truffle compile` and `truffle migrate` 
9. If the contract deployment success in terminal, you can as well see the contract deployment and its details in Ganache
10. Now, copy one of the private key from Ganache account and import it into the metamask wallet
11. Back to visual studio and in the terminal, run `npm run start` to start the project

### FAQ
1. If you found that any library hasn't been install, please try to copy the error shown in terminal or cmd.exe based on what you use and find the library through online to install it
2. If after truffle migrate, the project didn't run as you expected, please copy all the contents in `DragonSwap.json from contracts folder` to `src/abis/DragonSwap.json`, run `truffle migrate --reset --network development` and refresh the page again
