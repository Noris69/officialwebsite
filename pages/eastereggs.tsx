import { useCallback } from "react";
import { Paper, Snackbar, LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { DefaultCandyGuardRouteSettings, Nft } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import confetti from "canvas-confetti";
import Link from "next/link";
import Image from 'next/image';
import lvlimage from './img/level.png';
import eggimage from './img/egg.png';

import Countdown from "react-countdown";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { defaultGuardGroup, network } from "../src/config";

import { MultiMintButton } from "../src/MultiMintButton";
//import { MintButton } from "./MintButton";
import {
  MintCount,
  Section,
  Container,
  Column,
} from "../src/styles";
import { AlertState } from "../src/utils";
import NftsModal from "../src/NftsModal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import useCandyMachineV3 from "../src/hooks/useCandyMachineV3";
import {
  CustomCandyGuardMintSettings,
  NftPaymentMintSettings,
  ParsedPricesForUI,
} from "../src/hooks/types";
import { guardToLimitUtil } from "../src/hooks/utils";

const BorderLinearProgress = styled(LinearProgress)`
  height: 16px !important;
  border-radius: 30px;
  background-color: var(--alt-background-color) !important;
  > div.MuiLinearProgress-barColorPrimary{
    background-color: var(--primary) !important;
  }
  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-color: var(--primary);
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  width: 100%;

  @media only screen and (max-width: 450px) {
    top: 16px;
  }
`;
const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  margin: 30px;
  z-index: 999;
  position: relative;

  .wallet-adapter-dropdown-list {
    background: #ffffff;
  }
  .wallet-adapter-dropdown-list-item {
    background: #000000;
  }
  .wallet-adapter-dropdown-list {
    grid-row-gap: 5px;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 12px;
  width: 100%;
`

const Other = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 78px;
  width: 100%;
`
const ImageWrap = styled.div`
  aspect-ratio: 1 / 1;
  width: 100%;
  background-image: url(https://images.pexels.com/photos/2832432/pexels-photo-2832432.png);
  border-radius: 16px;
`
const Images = styled.div`
  height: 100%
  width: 100%;
`
const CollectionName = styled.h1`
  font-weight: 800;
  font-size: 64px;
  line-height: 100%;
  color: #DE1133;

  @media only screen and (max-width: 1024px) {
    font-size: 48px;
  }

  @media only screen and (max-width: 450px) {
    font-size: 40px;
  }
`
const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 520px;
  padding: 0;
  gap: 16px;
  flex-wrap: wrap;
`
const InfoBox = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
padding: 48px 56px;
gap: 8px;
border: 1px solid #DE1133;
border-radius: 4px;
font-weight: 400;
font-size: 20px;
line-height: 100%;
text-transform: uppercase;
color: var(--white);

  @media only screen and (max-width: 450px) {
    font-size: 18px;
  }
 
`
const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 24px;
  margin-bottom: -3px;
`
const CollectionDescription = styled.p`
  font-weight: 400;
  font-size: 33px;
  line-height: 150%;
  color: #DE1133;
  margin-left:-72px;

`
const MintedByYou = styled.span`
  font-style: italic;
  font-weight: 500;
  font-size: 16px;
  line-height: 100%;
  text-transform: none;
`
const ProgressbarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
`
const StartTimer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 48px;
  background: var(--alt-background-color);
  border-radius: 8px;
  @media only screen and (max-width: 450px) {
    gap: 16px;
    padding: 16px;
    width: -webkit-fill-available;
    justify-content: space-between;
  }
`
const StartTimerInner = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 16px;
  min-width: 90px;
  border-radius: 0px !important;
  box-shadow: none !important;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  background: none !important;
  text-transform: uppercase;
  color: var(--white);
  span {
    font-style: normal;
    font-weight: 800;
    font-size: 48px;
    line-height: 100%;
  }

  @media only screen and (max-width: 450px) {
    min-width: 70px;
    span {
      font-size: 32px;
    }
  }
`;
const StartTimerWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 0px;
  gap: 16px;
  width: -webkit-fill-available;
`
const StartTimerSubtitle = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: #FFFFFF;
`
const PrivateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: -webkit-fill-available;
`
const PrivateText = styled.h2`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 24px;
  gap: 10px;
  background: var(--error);
  border-radius: 4px;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white);
  width: -webkit-fill-available;
`
const PrivateSubtext = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: var(--white);
`
const WalletAmount = styled.div`
  color: var(--white);
  width: auto;
  padding: 8px 8px 8px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 5px;
  background-color: var(--primary);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 600;
  line-height: 100%;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 13px !important;
  padding: 6px 16px;
  background-color: #DF1133 !important;
  color: #DF1133;
  margin: 0 auto;
`;
const ConnectWallet = styled(WalletMultiButton)`
padding: 27px 75px;
background-color: #DF1133;
border-radius: 20px;
display: flex;
flex-direction: row;
align-items: center;
color: var(--white);
margin-top:200px;
margin-left: 600px;
border: none;
font-family: 'Pixellari';
font-style: normal;
font-weight: 600;
font-size: 20px;
line-height: 150%;
text-transform: uppercase;
max-width: 120px; 
`
export const NumberWrap = styled.div`
display: flex;
flex-direction: row;
justify-content: center;
align-items: stretch;
padding: 16px;
gap: 8px;
background: rgba(255, 255, 255, 0.1);
border-radius: 6px;  
`


const Home = () => {
  
  const Box = styled.div`
  position: absolute;
  top: 120px;
  left: 47px;
  width: 420px;
  height: 281px;
  border: 1px solid #DE1133;
  opacity: 1;
`;
const SecondBox = styled.div`
  margin-top: 20px;
  margin-left: 493px;
  width: 724px;
  height: 169px;
  border: 1px solid #DE1133;
  opacity: 1;
`;

  
  



  return (
    <main>
      <>
        <Header style={{    marginTop: '10px',
}}>
      
        <div
  className="links-container"
  style={{
    display: 'flex',
    gap: `${50}px`,
    alignItems: 'center',
    marginRight: '800px',

    justifyContent: 'flex-start',
  }}
>
        <Link href="/levels">
    <a style={{
        font: 'normal normal medium 20px/26px Pixellari',
        fontSize: 20,
        letterSpacing: '0px',
        color: '#DF1133',
        opacity: 1
      }}>LEVELS</a>
  </Link>

  <Link href="/">
    <a style={{
        textAlign: 'left',
        fontSize: 20,

        font: 'normal normal medium 20px/26px Pixellari',
        letterSpacing: '0px',
        color: '#DF1133',
        opacity: 1
      }}>MINTS</a>
  </Link>

  <Link href="/eastereggs">
    <a style={{
        textAlign: 'left',
        fontSize: 20,

        font: 'normal normal medium 20px/26px Pixellari',
        letterSpacing: '0px',
        color: '#DF1133',
        opacity: 1
      }}>EASTEREGGS</a>
  </Link>
  </div>
  
          
          
        </Header>
        <div
  style={{
    width: '80%',
    height: '2px',
    background: '#DF1133',
    opacity: 1,
    marginTop: '7%',
    marginLeft:'10%'

    
  }}
/>
           
<div >
         <div style={{
  position: 'absolute',
  top: '20%',
  left: '9%',
  width: '15%',
  height: '18%',
  background: '#1A1A1A 0% 0% no-repeat padding-box',
  boxShadow: '4px 4px 10px #DE1133C7',
  border: '2px solid #DE1133',
  opacity: '1'
}}>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-25px', marginTop:'10px'}}>INSISTENT</p>

</div>

</div>
<div
  style={{
    position: 'absolute',
    top: '20%',
    left: '25.5%',
    width: '15%',
    height: '18%',
    background: '#1A1A1A',
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: 1,
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-8px', marginTop:'10px'}}>HOME</p>


</div>
</div>

<div 
  style={{
    position: 'absolute',
    top: '20%',
    left: '42.5%',
    width: '15%',
  height: '18%',
    background: '#1A1A1A 0% 0% no-repeat padding-box',
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: '1'
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-8px', marginTop:'10px'}}>LOGIC</p>


</div>
</div>
<div
  style={{
    position: 'absolute',
    top: '20%',
    left: '59.5%',
    width: '15%',
  height: '18%',
    background: '#1A1A1A',
    boxShadow: '4px 4px 10px #DE1133C7',
    border: '2px solid #DE1133',
    opacity: 1,
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-32px', marginTop:'10px'}}>PERSPECTIF</p>


</div>
</div>
<div
  style={{
    position: 'absolute',
    top: '20%',
    left: '76.5%',
    width: '15%',
  height: '18%',
    background: '#1A1A1A',
    boxShadow: '4px 4px 10px #DE1133C7',
    border: '2px solid #DE1133',
    opacity: 1,
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-45px', marginTop:'10px'}}>NOW IT'S CLEAR</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "48%",
    left: '9%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-25px', marginTop:'10px'}}>PATIENT</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "48%",
    left: '25.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-15px', marginTop:'10px'}}>TRUTH</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "48%",
    left: '42.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-8px', marginTop:'10px'}}>SEIZE</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "48%",
    left: "59.5%",
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-15px', marginTop:'10px'}}>FUSION</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "48%",
    left: '76.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-25px', marginTop:'10px'}}>PARALLEL</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "77%",
    left: "9%",
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-15px', marginTop:'10px'}}>HIDDEN</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "77%",
    left: '25.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'100%', marginLeft:'-8px', marginTop:'10px'}}>DEVIL</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "77%",
    left: '42.5%',
    width: '15%',
    height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'18px', marginLeft:'-25px', marginTop:'10px'}}>ORIGINES</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "77%",
    left: '59.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'18px', marginLeft:'-15px', marginTop:'10px'}}>BOOKS</p>


</div>
</div>
<div
  style={{
    position: "absolute",
    top: "77%",
    left: '76.5%',
    width: '15%',
  height: '18%',
    background: "#1A1A1A",
    boxShadow: "4px 4px 10px #DE1133C7",
    border: "2px solid #DE1133",
    opacity: "1"
  }}
>
<div style = {{marginLeft:'40%', marginTop:'15%'}}>
<Image src={eggimage} alt="level"  />
<p style={{color:'#DF1133', fontSize:'18px', marginLeft:'-25px', marginTop:'10px'}}>2ND FACE</p>


</div>
</div>
 




</div>  
              

   
                  

            
        
      </>
     
    </main>
  );
};

export default Home;

const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <StartTimerWrap>
      <StartTimerSubtitle>Mint opens in:</StartTimerSubtitle>
      <StartTimer>
      <StartTimerInner elevation={1}>
        <span>{days}</span>Days
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{hours}</span>
        Hours
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{minutes}</span>Mins
      </StartTimerInner>
      <StartTimerInner elevation={1}>
        <span>{seconds}</span>Secs
      </StartTimerInner>
    </StartTimer>
    </StartTimerWrap>
  );
};
