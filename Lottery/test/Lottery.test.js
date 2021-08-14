const assert = require("assert"); // helper library from Node
const ganache = require("ganache-cli"); // our local TestNet
const Web3 = require("web3"); // creating a Constructor function 
const web3 = new Web3(ganache.provider()); //  new instance. provider() allows us to connect to the network 
const { interface, bytecode } = require("../compile"); // import ABI + bytecode

let lottery;
let accounts;


beforeEach(async () => {
  accounts = await web3.eth.getAccounts(); // get list of accounts 
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows an account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0], 
      value: web3.utils.toWei('3', 'ether'), // converts '100000000000'etc into readable eth 
    });

    const players = await lottery.methods.listPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0] , players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0], 
      value: web3.utils.toWei('3', 'ether'), // converts '100000000000'etc into readable eth 
    });
    await lottery.methods.enter().send({
      from: accounts[1], 
      value: web3.utils.toWei('3', 'ether'), // converts '100000000000'etc into readable eth 
    });
    await lottery.methods.enter().send({
      from: accounts[2], 
      value: web3.utils.toWei('3', 'ether'), // converts '100000000000'etc into readable eth 
    });

    const players = await lottery.methods.listPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0] , players[0]);
    assert.equal(accounts[1] , players[1]);
    assert.equal(accounts[2] , players[2]);
    assert.equal(3, players.length);
  });

  it("requires a min amount of eth to enter the lottery", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err) {
      assert(err) // 
    }
  });


  it("only lets the manager can call pickWinner()", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1], // purposely putting an incorrect account to fail the test 
      });
      assert(false);
    } catch (err) {
      assert(err) 
    }
  });

  it("sends money to the winner and resets the Players array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether') // 2eth 
    });

    // get the balance of an account (or how much eth it controls)
    const initBalance = await web3.eth.getBalance(accounts[0]); // returns in Wei 
    
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })

    const finalBalance = await web3.eth.getBalance(accounts[0])
    // the difference between initBalance and finalBalance will be slightly less than 2eth because of gas. Here's how to handle that: 
    const diff = finalBalance - initBalance;
    // console.log(web3.utils.fromWei(diff, 'ether')); // will show you gasCost 
    console.log(diff); // will show you gasCost 
    assert(diff > web3.utils.toWei('1.8', 'ether')) // 1.8 allows for some gas cost 

  });
});
