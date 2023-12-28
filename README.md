1.Download and open this folder with visual studio code(VSC) <br/> 2.Open terminal in VSC  <br/> 3.cd ammswap-main <br/> 4.Open your Ganache and start a new workspace with any name <br/> 5.In Ganache, click 'import project', import truffle_config.js of this project to Ganache <br/> 6.In VSC terminal, run: <br/> truffle compile  <br/> truffle migrate --reset <br/> After successful migration, you will see the transactions on Ganache <br/>

## When you gets error after truffle compile<br/>Replace the Ownable.sol in \ammswap-main\ammswap-main\node_modules\@openzeppelin\contracts\access with the one this github
<br/> client folder is for react (fyi it's created with <br/> npm install create-react-app<br/> npx create-react-app client)
<br/> 
## To run the react webapp for the first time,  
<br/> 1. In terminal of /path/to/directory/ammswap-main <br/> truffle migrate --reset<br/> npm install web3<br/><br/>
2.In terminal of client (cd client) <br/> npm install ethers react-query react-query/devtools
<br/> Subsequent run of react app,<br/> cd client<br/> npm start<br/><br/>
## To run test/test.js for the first time<br/> 
npm install --save-dev mocha chai truffle<br/>Subssequent run of test.js<br/>npx truffle test
