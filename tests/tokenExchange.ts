import * as anchor from "@coral-xyz/anchor";
import { web3, Program, AnchorError } from "@coral-xyz/anchor";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TokenExchange } from "../target/types/token_exchange";
import {
    LAMPORTS_PER_SOL,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
  } from "@solana/web3.js";
import {
    createInitializeMintInstruction,
    TOKEN_PROGRAM_ID,
    MINT_SIZE,
    getMinimumBalanceForRentExemptMint,
    createMint,
    createAssociatedTokenAccount,
    mintTo,
    setAuthority,
    getAssociatedTokenAddress,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getOrCreateAssociatedTokenAccount,
    getAccount,
  } from "@solana/spl-token";
import { airdropSol, createAta } from "./libs/utils";
import { SEND_TOKEN_AMOUNT, RECV_TOKEN_AMOUNT, TOKEN_DECIMALS} from "./libs/constants";
import * as bs58 from "bs58";
import { simulateTransaction } from "@coral-xyz/anchor/dist/cjs/utils/rpc";
import { expect, assert, use as chaiUse } from "chai";


interface EditOfferInput {
    incReceivedTokenAmount: number;
    decReceivedTokenAmount: number;
}

describe("Token_Swap", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const provider: AnchorProvider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    const owner = provider.publicKey;
    const program = anchor.workspace.TokenExchange as Program<TokenExchange>;
    const programId: PublicKey = program.programId;
    const Seeds = {
        SEED_MAIN_STATE: utf8.encode("main_state"),
        SEED_ALLOWED_TOKEN: utf8.encode("allowed_token1"),
        SEED_OFFER: utf8.encode("offer8"),
    }
    
    const mainStateAccount: PublicKey = web3.PublicKey.findProgramAddressSync([Seeds.SEED_MAIN_STATE], programId)[0];
    const feeReceiver: PublicKey = new web3.PublicKey("2JBAzzmqZwgi9MjKXsQehtcZyUrTta5jdxSiAi8onaaZ")

    const feePayer: Keypair = Keypair.generate();
    
    // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
    const offeror: Keypair = Keypair.fromSecretKey(
        bs58.decode(
        "4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp"
        )
    );

    // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
    const acceptor: Keypair = Keypair.fromSecretKey(
        bs58.decode(
        "588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2"
        )
    );

    let sendToken: PublicKey;
    let recvToken: PublicKey;
    let offerorSendTokenAta: PublicKey;
    let offerorRecvTokenAta: PublicKey;
    let acceptorSendTokenAta: PublicKey;
    let acceptorRecvTokenAta: PublicKey;
    let offerStateAccount: PublicKey;
    let offerStateAccountAta: PublicKey;
    let feeReceiverSendAta: PublicKey;
    let feeReceiverRecvAta: PublicKey;
    let offeredTokenAllowedChecker: PublicKey;
    let requestedTokenAllowedChecker: PublicKey;
    
    function calcNonDecimalValue(value: number, decimal: number): number {
        return Math.trunc(value * (10 ** decimal));
    }

    function __getAllowTokenCheckAccount(token: web3.PublicKey): web3.PublicKey {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.SEED_ALLOWED_TOKEN, token.toBytes(),
        ], programId)[0];
    }

    async function printBalances() {
        let offerorSendTokenAmount;
        let offerorRecvTokenAmount;
        let acceptorSendTokenAmount;
        let acceptorRecvTokenAmount;
        
        console.log('<<<<<<<<<<<<<< current balances >>>>>>>>>>>>');
        offerorSendTokenAmount = await connection.getTokenAccountBalance(offerorSendTokenAta);
        offerorRecvTokenAmount = await connection.getTokenAccountBalance(offerorRecvTokenAta);
        console.log('offeror.sendTokenAmount = ', offerorSendTokenAmount.value.uiAmount, '  recvTokenAmount = ', offerorRecvTokenAmount.value.uiAmount);

        acceptorSendTokenAmount = await connection.getTokenAccountBalance(acceptorSendTokenAta);
        acceptorRecvTokenAmount = await connection.getTokenAccountBalance(acceptorRecvTokenAta);
        console.log('acceptor.sendTokenAmount = ', acceptorSendTokenAmount.value.uiAmount, '  recvTokenAmount = ', acceptorRecvTokenAmount.value.uiAmount);
    }


    it("setup", async () => {
        let txhash;

        await airdropSol(
            connection, 
            feePayer.publicKey, 
            99999 * LAMPORTS_PER_SOL
        );

        await airdropSol(
            connection, 
            offeror.publicKey, 
            99999 * LAMPORTS_PER_SOL
        );

        await airdropSol(
            connection, 
            acceptor.publicKey, 
            99999 * LAMPORTS_PER_SOL
        );

        // create sendToken
        sendToken = await createMint(
            connection, 
            feePayer, 
            offeror.publicKey, 
            offeror.publicKey, 
            TOKEN_DECIMALS
        );

        // create offerorSendToken account
        offerorSendTokenAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            sendToken,
            offeror.publicKey
        );
        
        // mint sendTokens
        txhash = await mintTo(
            connection,
            feePayer,
            sendToken,
            offerorSendTokenAta,
            offeror,
            calcNonDecimalValue(SEND_TOKEN_AMOUNT, TOKEN_DECIMALS)
        );

        
        // create recvToken
        recvToken = await createMint(
            connection,
            feePayer,
            acceptor.publicKey,
            acceptor.publicKey,
            TOKEN_DECIMALS
        );

        // create acceptorRecvToken account
        acceptorRecvTokenAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            recvToken,
            acceptor.publicKey
        );

        // mint recvTokens
        txhash = await mintTo(
            connection,
            feePayer,
            recvToken,
            acceptorRecvTokenAta,
            acceptor,
            calcNonDecimalValue(RECV_TOKEN_AMOUNT, TOKEN_DECIMALS)
        );

        // create remaining accounts
        offerorRecvTokenAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            recvToken,
            offeror.publicKey
        );

        acceptorSendTokenAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            sendToken,
            acceptor.publicKey
        );

        printBalances();


        offerStateAccount = web3.PublicKey.findProgramAddressSync(
            [Seeds.SEED_OFFER, offeror.publicKey.toBytes(), sendToken.toBytes(), recvToken.toBytes()], programId)[0];
        offeredTokenAllowedChecker = web3.PublicKey.findProgramAddressSync(
            [Seeds.SEED_ALLOWED_TOKEN, sendToken.toBytes()], programId)[0];
        requestedTokenAllowedChecker = web3.PublicKey.findProgramAddressSync(
            [Seeds.SEED_ALLOWED_TOKEN, recvToken.toBytes()], programId)[0];

        feeReceiverSendAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            sendToken,
            feeReceiver
        );
        feeReceiverRecvAta = await createAssociatedTokenAccount(
            connection,
            feePayer,
            recvToken,
            feeReceiver
        );
    })

    it("Initialize main state", async () => {
        const feeRate = new anchor.BN(calcNonDecimalValue(0.25, 6))
        let res = await program.methods.initMainState(
            {
                feeRate,
                feeReceiver
            }
        ).accounts({
            owner,
            systemProgram: web3.SystemProgram.programId,
            mainStateAccount,
        }).rpc();
    });

    it("Fetch main state", async () => {
        const res = await program.account.mainState.fetch(mainStateAccount);
        console.log("MainState :", res);
    })

    // it("Update main state", async () => {
    //     const feeRate = new anchor.BN(calcNonDecimalValue(0.3, 6))
    //     let res = await program.methods.updateMainState(
    //         {
    //             feeRate,
    //             feeReceiver
    //         }
    //     ).accounts({
    //         owner,
    //         systemProgram: web3.SystemProgram.programId,
    //         mainStateAccount,
    //     }).rpc();
    // });

    it("Allow tokens", async () => {
        let allowTokenStateAccount;
        let res;
        
        allowTokenStateAccount = __getAllowTokenCheckAccount(sendToken);
        res = await program.methods.allowToken().accounts({
            owner,
            mainState: mainStateAccount,
            systemProgram: web3.SystemProgram.programId,
            allowTokenStateAccount,
            token: sendToken
        }).rpc();

        allowTokenStateAccount = __getAllowTokenCheckAccount(recvToken);
        res = await program.methods.allowToken().accounts({
            owner,
            mainState: mainStateAccount,
            systemProgram: web3.SystemProgram.programId,
            allowTokenStateAccount,
            token: recvToken
        }).rpc();
    })

    it("Init offer state", async () => {
        let res;

        offerStateAccountAta = await getAssociatedTokenAddress(
            sendToken,
            offerStateAccount,
            true
        );

        res = await program.methods.initOfferState().accounts({
            offeror: offeror.publicKey,
            offeredToken: sendToken,
            requestedToken: recvToken,
            offerStateAccount,
            offerStateAccountAta,
            offeredTokenAllowedChecker,
            requestedTokenAllowedChecker,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        }).signers([offeror])
        .rpc();

        console.log("res =", res);
    })

    it("Create offer", async () => {
        let res;

        res = await program.methods.createOffer(
            new anchor.BN(calcNonDecimalValue(SEND_TOKEN_AMOUNT / 2, TOKEN_DECIMALS)), 
            new anchor.BN(calcNonDecimalValue(RECV_TOKEN_AMOUNT / 2, TOKEN_DECIMALS)), 
            new anchor.BN(calcNonDecimalValue(RECV_TOKEN_AMOUNT / 10, TOKEN_DECIMALS))
        ).accounts({
            offeror: offeror.publicKey,
            offeredToken: sendToken,
            requestedToken: recvToken,
            mainStateAccount,
            offerorAta: offerorSendTokenAta,
            offerStateAccount,
            offerStateAccountAta,
            offeredTokenAllowedChecker,
            requestedTokenAllowedChecker,
            feeReceiverAta: feeReceiverSendAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).signers([offeror])
        .rpc();

        printBalances();
    })

    it("Accept offer partial (1)", async () => {
        let res;

        res = await program.methods.acceptOffer(
            new anchor.BN(calcNonDecimalValue(RECV_TOKEN_AMOUNT / 10, TOKEN_DECIMALS))
        ).accounts({
            acceptor: acceptor.publicKey,
            offeredToken: sendToken,
            requestedToken: recvToken,
            mainStateAccount,
            acceptorOfferedTokenAta: acceptorSendTokenAta,
            acceptorRequestedTokenAta: acceptorRecvTokenAta,
            offerorRequestedTokenAta: offerorRecvTokenAta,
            offerStateAccount,
            offerStateAccountAta,
            feeReceiverAta: feeReceiverRecvAta,
            tokenProgram: TOKEN_PROGRAM_ID
        }).signers([acceptor])
        .rpc();
        
        /*
        res.feePayer = acceptor.publicKey;
        res.recentBlockhash = (await (connection as web3.Connection).getLatestBlockhash()).blockhash;
        console.log("res =", await (connection as web3.Connection).simulateTransaction((res as Transaction).compileMessage(), [acceptor]));
        */

        printBalances();
    })

    it("Edit offer", async () => {
        let res;
        const tmpInput: EditOfferInput = 
            {incReceivedTokenAmount: new anchor.BN(calcNonDecimalValue(RECV_TOKEN_AMOUNT * 2 / 5, TOKEN_DECIMALS)), 
            decReceivedTokenAmount: new anchor.BN(0)};
        
        res = await program.methods.editOffer(
            tmpInput
        ).accounts({
            offeror: offeror.publicKey,
            offeredToken: sendToken,
            requestedToken: recvToken,
            mainStateAccount,
            offerStateAccount
        }).signers([offeror])
        .rpc();
    })

    it("Accept offer partial (2)", async () => {
        let res;

        res = await program.methods.acceptOffer(
            new anchor.BN(calcNonDecimalValue(RECV_TOKEN_AMOUNT * 4 / 5, TOKEN_DECIMALS))
        ).accounts({
            acceptor: acceptor.publicKey,
            offeredToken: sendToken,
            requestedToken: recvToken,
            mainStateAccount,
            acceptorOfferedTokenAta: acceptorSendTokenAta,
            acceptorRequestedTokenAta: acceptorRecvTokenAta,
            offerorRequestedTokenAta: offerorRecvTokenAta,
            offerStateAccount,
            offerStateAccountAta,
            feeReceiverAta: feeReceiverRecvAta,
            tokenProgram: TOKEN_PROGRAM_ID
        }).signers([acceptor])
        .rpc();

        printBalances();
    })

    it("Close offer", async () => {
        let res;

        try {
            res = await program.methods.closeOffer().accounts({
                offeror: offeror.publicKey,
                offeredToken: sendToken,
                requestedToken: recvToken,
                mainStateAccount,
                offerStateAccount,
                offerorAta: offerorSendTokenAta,
                offerStateAccountAta,
                tokenProgram: TOKEN_PROGRAM_ID
            }).signers([offeror]).rpc();

            printBalances();
        } catch (err) {
            // console.log(err)
            expect(err).to.be.instanceOf(AnchorError)
            expect((err as AnchorError).error.errorCode.number).to.equal(6008)
            console.log((err as AnchorError).error.errorCode)
        }
    })

    it("Disallow tokens", async () => {
        let allowTokenStateAccount;
        let res;

        allowTokenStateAccount = __getAllowTokenCheckAccount(sendToken);
        // console.log("Disallow sendToken state: ", allowTokenStateAccount.toBase58());

        res = await program.methods.disallowToken().accounts({
            owner,
            mainState: mainStateAccount,
            systemProgram: web3.SystemProgram.programId,
            allowTokenStateAccount,
            token: sendToken
        }).rpc();

        allowTokenStateAccount = __getAllowTokenCheckAccount(recvToken);
        // console.log("Disallow recvToken state: ", allowTokenStateAccount.toBase58());

        res = await program.methods.disallowToken().accounts({
            owner,
            mainState: mainStateAccount,
            systemProgram: web3.SystemProgram.programId,
            allowTokenStateAccount,
            token: recvToken
        }).rpc();
    })

    it("Transfer OwnerShip", async () => {
        const res = await program.methods.updateMainStateOwner(new web3.PublicKey("Ck1sj5K9ERW36ZnPJQ4d19SS4QCrkYJQprfZJzWD7Sen")).accounts({
            systemProgram: web3.SystemProgram.programId,
            mainStateAccount,
            owner,
        }).rpc();

        console.log("Res: ", res);
    })
});
