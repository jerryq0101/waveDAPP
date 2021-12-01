import React, {useEffect, useState, useRef} from "react";
import { ethers } from "ethers";
import './App.css';
import contractJson from "./utils/WavePortal.json"


export default function App() {

  
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x8e3105a05B530EA09cF449326E23Da9a977EfAFB";
  const contractABI = contractJson.abi

  componentDidMount => {
      getAllWaves();
  }

  const checkIfWalletIsConnected = async () => {

    try {
    // Access to window.Ethereum
    const { ethereum } = window;

    if (!ethereum){
      console.log("Make sure you have metamask!");
    } else {
      console.log("Have the ethereum object", ethereum);
    }

    // If we are authorized to access user's wallet

    const accounts = await ethereum.request({method: "eth_accounts"});

    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    } 
    } catch (error) {
        console.log(error);
    }
  }
  const [allWaves, setAllWaves] = useState([]);
  
  const getAllWaves = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Get all Waves Call
        const waves = await wavePortalContract.getAllWaves();

        // Waves Thing
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });


        setAllWaves(wavesCleaned.reverse());
      } 
      else {
        console.log("eth obj doesn't exist")
      } 
      
    } catch (error) {
        console.log(error);
      }
  }

  getAllWaves();
  



  // Connect wallet method
  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum){
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  let count = 0;
  const inputRef = useRef();



  const wave = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        console.log("Ethereum object doesn't exist");
        connectWallet();
      } else if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer); 

        // Executing the total waves from the smart contract

        const waveTxn = await wavePortalContract.wave(inputRef.current.value, {gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("mined --", waveTxn.hash);

        const countObj = await wavePortalContract.getTotalWaves();

        count = countObj.toNumber();
        console.log("Amount of waves: ", count);
        getAllWaves();
      } 
    } catch (error) {
        console.log(error);
  
    }
  }

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [...prevState, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      }])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    }
  }, [])

  random_hex_color_code => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  };


  return (

  <div>
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap" rel="stylesheet"></link>

      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            👋 AY YO!
          </div>

          <div className="bio">
            
            I am Jerry and I am a blockchain enthusiast, this site is lit. Connect your wallet and wave at me for free moneys!
          </div>

          <input className="inputField" ref={inputRef} required/>

          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>

          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          
          {
            allWaves.map((wave) => {

            return (
              
              <div className="message">
                <div className="messageText" >
                  Address: {wave.address}
                </div>
                <div>
                  {wave.message} 
                </div>
                <div>
                  Time: {wave.timestamp.toString()}
                </div>
              </div>
            )
          })
          }
        </div>
      </div>
      
    </div>
  );
}
