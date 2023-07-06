import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { web3 } from '@project-serum/anchor'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import './App.css';
import { Connectivity, EditOfferInput } from './connectivity';

require('@solana/wallet-adapter-react-ui/styles.css');
const log = console.log;

function App() {
    const solNetwork = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

    const wallets = useMemo(
        () => [
            new SolflareWalletAdapter(),
            new PhantomWalletAdapter(),
            new SolletWalletAdapter(),
        ],
        [solNetwork]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={true}>
                <WalletModalProvider>
                    <Content />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

const Content = () => {
    const wallet = useWallet();
    const connectivity = new Connectivity(wallet);
    let newRequestedTokenAmount = 0;
    let newMinRequestedTokenAmount = 0;
    let amount = 0;
    let offeredTokenAcount = 0;
    let requestedTokenAmount = 0;
    let minRequestedToken = 0;
    let offeror: web3.PublicKey
    let offerId: web3.PublicKey;
    let offeredToken: web3.PublicKey;
    let requestedToken: web3.PublicKey;
    let tokenId: web3.PublicKey;

    /*
        A: 9 = D8jzT2tFPoneyG8vXer6Krw1hCfXrAWCAAKUqfMp9QC3
        B: 9 = Aeau4hdegEeFL26NACXZoXJVmJam99tdPk3VQKNtYdxf
        O: 9 = 6n7QdQiQdsufaLBvo5gaK1LJzCaFbzuNibC4BbWH9VeV 
        O: 6 = Bxmzgf4bNvzub7RGKv2YWG3vJDHSQxsmHJM92UvJNRKL
        O: 4 = ETVk11KS5XmyYfrbXLcUwX8JcUvA8JyJNKtm2d2V9iUL
    */

    return <>
        <WalletMultiButton />
        <hr />
        <h3>  User Side (Offeror) </h3>
        <label htmlFor="">Offered TokenId:  </label>
        <input type="text" onChange={(e) => {
            const value = e.target.value
            if (value) {
                try {
                    offeredToken = new web3.PublicKey(value)
                } catch { }
            }
        }} /> <br></br>
        <label htmlFor="">Requested TokenId:  </label>
        <input type="text" onChange={(e) => {
            const value = e.target.value
            if (value) {
                try {
                    requestedToken = new web3.PublicKey(value)
                } catch { }
            }
        }} /> <br></br>

        <label htmlFor="">Offered TokenAmount:  </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                offeredTokenAcount = value
            }
        }} /> <br></br>
        <label htmlFor="">Requested Token Amount:  </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                requestedTokenAmount = value
            }
        }} /> <br></br>
        <label htmlFor="">Min Requested Token Amount:  </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                minRequestedToken = value
            }
        }} /> <br></br>

        <button onClick={async () => {
            if (
                offeredTokenAcount == 0 ||
                requestedTokenAmount == 0 ||
                minRequestedToken == 0
            ) {
                alert("Some passed value remain Zero! please re-enter of refresh page")
                return;
            }
            const res = await connectivity.createOffer(offeredToken, requestedToken, offeredTokenAcount, requestedTokenAmount, minRequestedToken);
        }}>
            Create Offer
        </button>
        <hr></hr>

        <label htmlFor="">OfferId:  </label>
        <input type="text" onChange={(e) => {
            const value = e.target.value
            if (value) {
                try {
                    offerId = new web3.PublicKey(value)
                } catch { }
            }
        }} />
        <br></br>
        <label htmlFor="">new requestedToken amount: </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                newRequestedTokenAmount = value
            }
        }} /> <br></br>

        <label htmlFor="">new min requestedToken amount: </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                newMinRequestedTokenAmount = value
            }
        }} />

        <br></br>
        <button onClick={async () => {
            if (
                newRequestedTokenAmount == 0 &&
                newMinRequestedTokenAmount == 0
            ) {
                alert("Some passed value remain Zero! please re-enter of refresh page")
                return;
            }
            log("newRequestedTokenAmounti: ", newRequestedTokenAmount)
            log("newMinRequestedTokenAmount: ", newMinRequestedTokenAmount)

            const input: EditOfferInput = {
                // incOfferedTokenAmount,
                // decOfferedTokenAmount,
                offerId,
                newRequestedTokenAmount,
                newMinRequestedTokenAmount,
            }
            const res = await connectivity.editOffer(input)
        }}>
            Edit Offer
        </button>

        <button onClick={async () => {
            await connectivity.closeOffer(offerId);
        }}
        >Close Offer</button>
        <br></br>
        <br></br>
        <hr></hr>

        <h3>  User Side (Acceptor) </h3>
        <label htmlFor="">OfferId:  </label>
        <input type="text" onChange={(e) => {
            const value = e.target.value
            if (value) {
                try {
                    offerId = new web3.PublicKey(value)
                } catch { }
            }
        }} />
        <label htmlFor="">Amount:  </label>
        <input type="number" onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value) {
                amount = value
            }
        }} />

        <button onClick={async () => {
            if (
                amount == 0
            ) {
                alert("Amount value remain Zero! please re-enter of refresh page")
                return;
            }
            const res = await connectivity.acceptOffer(offerId, amount);
        }}>
            Accept Offer
        </button>
        <hr></hr>
        <hr></hr>


        <h3> Admin Side </h3>
        <label htmlFor="">TokenId</label>
        <input type="text" onChange={(e) => {
            const value = e.target.value;
            if (value) {
                tokenId = new web3.PublicKey(value)
            }
        }} />
        <button onClick={async () => {
            connectivity._allowToken(tokenId);
        }}> Allow Token </button>
        <button onClick={async () => {
            connectivity._disAllowToken(tokenId);
        }}> DisAllow Token</button>

        <br></br>
        <hr></hr>
        <hr></hr>

        <button onClick={async () => {
            connectivity._listenEvents();
        }}> Start Event Listining</button>

        <button onClick={async () => {
            await connectivity._getAllProgramAccounts();
        }}> Get full info </button>

    </>
}

export default App;
