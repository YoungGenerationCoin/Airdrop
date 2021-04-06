import MetaMaskOnboarding from '@metamask/onboarding'
// eslint-disable-next-line camelcase
import { encrypt, recoverPersonalSignature, recoverTypedSignatureLegacy, recoverTypedSignature, recoverTypedSignature_v4 } from 'eth-sig-util'
import { ethers, Contract } from 'ethers'
import { toChecksumAddress } from 'ethereumjs-util'
import { ygcBytecode, ygcAbi } from './constants.json'


let ethersProvider //ether provider ~ web3
let ygcProvider //contract provider
let curAccount
let curChainId

const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:8888'
  : undefined

const { isMetaMaskInstalled } = MetaMaskOnboarding
//Main
const tokenAddress_test = '0x9f808256824a1c9b57799fa7d136ac019a5d2a13';
const contextChanId = 56;
//Test
// const tokenAddress_test = '0xf16b365fdeb71e8011a921807b3ffd8d37ba70c2';
// const contextChanId = 97;

var ygcBalance = 0;
var curBNBPrice = 0;
var curYGCPrice = 0.1;
var minBuy = 40;
//Button connect wallet, button getbalance
var buttonConnectWallet1 = document.getElementById("buttonConnectWallet1");
var buttonConnectWallet2 = document.getElementById("buttonConnectWallet2");
var buttonBalanceBNB1 = document.getElementById("buttonBalanceBNB1");
var buttonBalanceBNB2 = document.getElementById("buttonBalanceBNB2");
var buttonBalanceYGC1 = document.getElementById("buttonBalanceYGC1");
var buttonBalanceYGC2 = document.getElementById("buttonBalanceYGC2");

//total left
var ygcLeft = document.getElementById('left_quantity');
//ref link
var refLink = document.getElementById('ref-link');

//Notify
function ShowMesageNotify(messageNoti) {
  var notifyMessage = document.getElementById("snackbar");
  notifyMessage.className = "show";
  notifyMessage.innerText = messageNoti;
  setTimeout(() => {
    notifyMessage.className = "";
  }, 2000);
}
var allButtons = document.getElementsByClassName('not-develop-button');

for (let index = 0; index < allButtons.length; index++) {
  const element = allButtons[index];
  element.onclick = function () {
    var text = "Functions are under development";
    ShowMesageNotify(text);
  };
}
//endnotify

//button pre-sale and airdrop
var presaleButton = document.getElementById('get-pre-sale-button');
var claimButton = document.getElementById('claim-button');
claimButton.disabled = true;
var domCurPrice = document.getElementById('ygc-price');
var domMinbuy = document.getElementById('ygc-min-buy');

domCurPrice.innerText = 'Price: $'+ curYGCPrice +'/GYC';
domMinbuy.innerText = 'Min buy: '+ minBuy + ' YGC';

function loadUsdPricePerBit() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      var doubleValue = parseFloat(obj.price);
      var btnPrice = document.getElementById('bnb-price');
      btnPrice.innerText = doubleValue.toFixed(2) + " BNB/USDT";
      curBNBPrice = doubleValue;
    }
  };
  xhttp.open("GET", "https://api.binance.com/api/v1/ticker/price?symbol=BNBUSDT", true);
  xhttp.send();
}

loadUsdPricePerBit();
//ref link
var curReflink = currentUrl.search.replace('?','');

var copyLink = document.getElementById('copy-link');
var linkRef = document.getElementById('ref-link');

copyLink.onclick = function () {
  var text = linkRef.innerText;
  var elem = document.createElement("textarea");
  document.body.appendChild(elem);
  elem.value = text;
  elem.select();
  document.execCommand("copy");
  document.body.removeChild(elem);
  ShowMesageNotify('Copied the refLink');
}

linkRef.onclick = function () {
  var text = linkRef.innerText;
  var elem = document.createElement("textarea");
  document.body.appendChild(elem);
  elem.value = text;
  elem.select();
  document.execCommand("copy");
  document.body.removeChild(elem);
  ShowMesageNotify('Copied the refLink');
  return false;
}

const initialize = async () => {
  try {
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  } catch (error) {
    //console.error(error)
  }

  let onboarding
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin })
  } catch (error) {
    //console.error(error)
  }

  let accounts
  let isConnectAccount = false

  const isMetaMaskConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const onClickConnect = () => {
    if(curChainId != contextChanId){
      isConnectAccount = false;
      updateButtons();
      ShowMesageNotify('Please switch to Binance Smart Chain');
      return;
    }

    if (isConnectAccount) {
      return
    }
    
    getAccounts();

  }

  function InitContract() {
    ygcProvider = new Contract(tokenAddress_test, ygcAbi, ethersProvider);
    getBalanceOfAccout();
  }

  async function getAccounts() {
    try {
      const _accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      curAccount = _accounts[0];
      isConnectAccount = true
    } catch (err) {
      // console.error(err)
    }
  }

  function getCurrencyFormatNumbersOnly(value) {
    var format = {
      style: 'currency',
      currency: 'JPY',
      currencyDisplay: 'none',
    };
    const stripSymbols = (format.currencyDisplay === 'none')
    const localFormat = stripSymbols ? { ...format, currencyDisplay: 'code' } : format
    let result = Intl.NumberFormat('ja', localFormat).format(value)
    if (stripSymbols) {
      result = result.replace(/[a-z]{3}/i, "").trim()
    }
    return result
  }

  async function getBalanceOfAccout() {
    ethersProvider.getBalance(curAccount).then(function (balance) {
      buttonBalanceBNB1.innerText = ethers.utils.formatEther(balance, 'ether').substring(0, 5) + ' BNB';
      buttonBalanceBNB2.innerText = ethers.utils.formatEther(balance, 'ether').substring(0, 5) + ' BNB';
    });

    const balance = await ygcProvider.balanceOf(curAccount);
    var dBalance = parseFloat(ethers.utils.formatEther(balance, 'ether').toString());
    buttonBalanceYGC1.innerText = dBalance.toFixed(2) + ' YGC';
    buttonBalanceYGC2.innerText = dBalance.toFixed(2) + ' YGC';

    ygcBalance = dBalance;
    if (dBalance <= 0) { airDrop.claimButton = true; }

    const leftBalance = await ygcProvider.balanceOf('0x725aba5BEE3575f5042365Af50CDaFc25222aD40');
    var dBalance1 = parseFloat(ethers.utils.formatEther(leftBalance, 'ether').toString());
    ygcLeft.innerText = "Left: " + getCurrencyFormatNumbersOnly(dBalance1) + ' YGC';
  }

  async function sendBNB(buyAmount, quantityBNB, isAirdop){
    try{
      const result = await ethersProvider.getSigner().sendTransaction({
        to: '0x725aba5BEE3575f5042365Af50CDaFc25222aD40',
        value: ethers.utils.parseUnits(quantityBNB.toString(), 'ether').toHexString(),//'0x29a2241af62c0000',
        gasLimit: 21000,
        gasPrice: 10000000000,
      });
      var data = {
        hash: result.hash,
        parent: curReflink,
        amount: buyAmount,
        price: curYGCPrice,
        BNB: quantityBNB,
        isAirdrop: isAirdop,
        addres: curAccount,
      }
      // console.log(result);
      // console.log(result.hash);
      // console.log(ethers.utils.formatUnits(result.value, 'ether'));
    }catch{
      //user cancel
    }
  }

  //Presale and airdrop
  presaleButton.onclick = () => {
    if (!isConnectAccount) {
      ShowMesageNotify("Please connect wallet!");
      return;
    }
    var inputAmount = document.getElementById('buy-amount').value;
    var amount = parseInt(inputAmount);
    if (Object.is(amount, NaN) === true || amount === undefined || amount < minBuy) {
      ShowMesageNotify("Input buy amount is invalid!");
      return;
    }
    var bnbAmount = amount*curYGCPrice/curBNBPrice;
    sendBNB(amount, bnbAmount, false);
  };

  claimButton.onclick = () => {
    if (!isConnectAccount) {
      ShowMesageNotify("Please connect wallet!");
      return;
    }
    if(ygcBalance <= 0) {
      ShowMesageNotify("Please join pre-sale first");
      return;
    }
    var bnbAmount = 2/curBNBPrice;
    console.log(bnbAmount);
    sendBNB(100, bnbAmount, true);
  }


  function handleNewAccounts(newAccounts) {
    if(curChainId != contextChanId){
      isConnectAccount = false;
      updateButtons();
      ShowMesageNotify('Please switch to Binance Smart Chain');
      return;
    }

    if (newAccounts !== undefined && newAccounts.length >= 1) {
      //Connected account
      isConnectAccount = true;
      curAccount = newAccounts[0];
      refLink.href = "";
      refLink.innerText = currentUrl.origin + "/?" + curAccount;
      InitContract();
    } else {
      //No connect accout
      isConnectAccount = false;
    }

    updateButtons();
  }

  function handleNewChain(chainId) {
    curChainId = chainId;
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      })
      handleNewChain(chainId)
    } catch (err) {
      //console.error(err)
    }
  }

  const updateButtons = () => {
    if (isConnectAccount) {
      buttonConnectWallet1.innerText = curAccount.substring(0, 12) + '...';
      buttonConnectWallet2.innerText = curAccount.substring(0, 12) + '...';
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      buttonConnectWallet1.innerText = 'Connect Wallet'
      buttonConnectWallet1.onclick = onClickConnect
      buttonConnectWallet2.innerText = 'Connect Wallet'
      buttonConnectWallet2.onclick = onClickConnect
    }
  }



  if (isMetaMaskInstalled()) {
    ethereum.autoRefreshOnNetworkChange = false
    getNetworkAndChainId()

    ethereum.on('chainChanged', handleNewChain)
    ethereum.on('accountsChanged', handleNewAccounts)

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      })
      handleNewAccounts(newAccounts)
    } catch (err) {
      //console.error('Error on init when getting accounts', err)
    }
  }
  else {
    noti.innerText = "Please install Metamask";
    buttonConnectWallet1.onclick = onClickInstall;
    buttonConnectWallet2.onclick = onClickInstall;
    buttonConnectWallet1.disabled = false;
    buttonConnectWallet2.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', initialize);
