import { AnchorProvider, BN, IdlAccounts, IdlEvents, Program, web3 } from '@project-serum/anchor';
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    getMint,
    getAccount as getTokenAccount

} from '@solana/spl-token';
import { WalletContextState } from "@solana/wallet-adapter-react";

import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { ASSOCIATED_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { IDL, TokenExchange } from './token_exchange';
import { Metadata, PROGRAM_ADDRESS as MPL_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';

//NOTE: states types
const _MainStateTypeName = IDL.accounts[0].name;
type _MainStateType = IdlAccounts<TokenExchange>[typeof _MainStateTypeName]

const _OfferStateTypeName = IDL.accounts[2].name
type _OfferStateType = IdlAccounts<TokenExchange>[typeof _OfferStateTypeName]

const _AllowTokenStateTypeName = IDL.accounts[1].name;
type _AllowTokenStateType = IdlAccounts<TokenExchange>[typeof _AllowTokenStateTypeName]

export type OfferInfo = {
    offerId: string,
    data: {
        isActive: boolean;
        offeror: string;
        offeredToken: string;
        offeredTokenAmount: number;
        minRequestedAmount: number;
        requestedToken: string;
        requestedTokenAmount: number;
        // ratio: number;
    }
}

//NOTE: events types names
const _ETokenAllowedName = "TokenAllowed";
const _ETokenDisAllowedName = "TokenDisAllowed";
const _EOfferCreatedName = "OfferCreated";
const _EOfferAcceptedName = "OfferAccepted";
const _EOfferUpdatedName = "OfferUpdated";
const _EOfferRevokedName = "OfferRevoked";
const _EOfferCompletedName = "OfferCompleted";

type EOfferCreatedType = IdlEvents<TokenExchange>[typeof _EOfferCreatedName]
type EOfferAcceptedType = IdlEvents<TokenExchange>[typeof _EOfferAcceptedName]
type EOfferCompletedType = IdlEvents<TokenExchange>[typeof _EOfferCompletedName]
type EOfferUpdatedType = IdlEvents<TokenExchange>[typeof _EOfferUpdatedName]
type EOfferRevokedType = IdlEvents<TokenExchange>[typeof _EOfferRevokedName]
type ETokenAllowedType = IdlEvents<TokenExchange>[typeof _ETokenAllowedName]
type ETokenDisAllowedType = IdlEvents<TokenExchange>[typeof _ETokenDisAllowedName]

const log = console.log;
const systemProgram = web3.SystemProgram.programId;
const Seeds = {
    SEED_MAIN_STATE: utf8.encode("main_state"),
    SEED_ALLOWED_TOKEN: utf8.encode("allowed_token1"),
    SEED_OFFER: utf8.encode("Offer1"),
}

export interface EditOfferInput {
    offerId: web3.PublicKey,
    newRequestedTokenAmount: number,
    newMinRequestedTokenAmount: number
}

export class Connectivity {
    wallet: WalletContextState
    connection: web3.Connection;
    txis: web3.TransactionInstruction[] = [];
    txs: web3.Transaction[] = []
    txsInfo: any[] = []
    programId: web3.PublicKey
    program: Program<TokenExchange>
    mainStateAccount: web3.PublicKey
    extraSignature: web3.Keypair[] = []
    feeReceiver: web3.PublicKey
    cacheTokenDeciaml: Map<string, number>

    constructor(_wallet: WalletContextState) {
        this.wallet = _wallet;
        this.connection = new web3.Connection("https://api.devnet.solana.com", { commitment: 'confirmed' })

        this.programId = new web3.PublicKey("2mcXtmhv184eihwhqxvoD41QWyuDm4DirpFwHkpCrxyM")
        const anchorProvider = new AnchorProvider(this.connection, this.wallet, { commitment: 'confirmed', preflightCommitment: 'confirmed' })
        this.program = new Program(IDL, this.programId, anchorProvider);
        this.feeReceiver = new web3.PublicKey("2JBAzzmqZwgi9MjKXsQehtcZyUrTta5jdxSiAi8onaaZ")
        this.mainStateAccount = web3.PublicKey.findProgramAddressSync([Seeds.SEED_MAIN_STATE], this.programId)[0]
        this.cacheTokenDeciaml = new Map();
    }

    static calculateNonDecimalValue(value: number, decimal: number) {
        return Math.trunc(value * (10 ** decimal))
    }

    static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _sendTransaction(signatures: web3.Keypair[] = []) {
        try {
            if (this.extraSignature) signatures.push(...this.extraSignature)
            const tx = new web3.Transaction().add(...this.txis);
            // const res = await this.wallet.sendTransaction(tx, this.connection, { signers: signatures, preflightCommitment: 'confirmed' });

            tx.feePayer = this.wallet.publicKey;
            tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

            for (let i of signatures) tx.sign(i)
            let signedTx = await this.wallet.signTransaction(tx);
            const res = await this.connection.sendRawTransaction(signedTx.serialize())

            log("Trasaction Sign: ", res);
            alert("Trasaction Sussessful")
            return res;
        } catch (e) {
            log("Error: ", e);
            alert("Trasaction Fail")
        }

        finally {
            this.txis = [];
            this.extraSignature = [];
        }
    }

    async _addTx(tx: web3.Transaction, info: any, signatures: web3.Keypair[] = []) {
        this.txis = []
        tx.feePayer = this.wallet.publicKey
        tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash
        for (let signature of signatures)
            tx.sign(signature)

        this.txs.push(tx)
        this.txsInfo.push(info)
    }

    async _sendMultTransaction() {
        let rawTxs = await this.wallet.signAllTransactions(this.txs);
        this.txs = []
        let pass = []
        let fail = []
        let i = 0;

        for (let tx of rawTxs) {
            try {
                let raw = tx.serialize();
                const sign = await this.connection.sendRawTransaction(raw);
                pass.push({ info: this.txsInfo[i], sign })
            } catch (e) {
                fail.push({ info: this.txsInfo[i] })
            }
            finally {
                i += 1
            }
        }

        this.txs = []
        this.txsInfo = []
        this.extraSignature = []
        log("pass: ", pass)
        log("fail: ", fail)
    }

    async _getOrCreateTokenAccount(mint: web3.PublicKey, owner: web3.PublicKey, isOffCurve = false) {
        const ata = getAssociatedTokenAddressSync(mint, owner, isOffCurve);
        const info = await this.connection.getAccountInfo(ata);

        if (info == null) {
            log("added token account init")
            const ix = createAssociatedTokenAccountInstruction(this.wallet.publicKey, ata, owner, mint);
            this.txis.push(ix);
        }
        return ata;
    }

    _parseMainState(data: Buffer, verify: boolean = false, id: web3.PublicKey = null) {
        const state = this.program.coder.accounts.decode<_MainStateType>(_MainStateTypeName, data)
        if (verify) {
            const _mainStateAccountStr = this.mainStateAccount.toBase58()
            if (_mainStateAccountStr != id.toBase58()) return null;
        }
        return {
            owner: state.owner.toBase58(),
            feeRate: state.feeRate,
            feeReceiver: state.feeReceiver.toBase58(),
        }
    }

    _parseAllowedTokenState(data: Buffer, verify: boolean = false, id: web3.PublicKey = null) {
        const res = this.program.coder.accounts.decode<_AllowTokenStateType>(_AllowTokenStateTypeName, data)
        if (verify) {
            const _allowedTokenStateAccountStr = this.__getAllowTokenCheckAccount(res.mint).toBase58()
            if (_allowedTokenStateAccountStr != id.toBase58()) return null;
        }
        return res.mint.toBase58()
    }

    async _parseOfferState(data: Buffer, verify: boolean = false, id: web3.PublicKey = null) {
        const state = this.program.coder.accounts.decode<_OfferStateType>(_OfferStateTypeName, data)

        if (verify) {
            const offerStateAccountStr = this.__getOfferStateAccount(
                state.offeror,
                state.offeredToken,
                state.requestedToken,
                state.initTime.toNumber()
            ).toBase58();

            if (offerStateAccountStr != id.toBase58()) return null;
            if (!state.isActive) return null;
        }

        const offeredTokenDecimal = await this._getTokenDecimal(state.offeredToken)
        const requestedTokenDecimal = await this._getTokenDecimal(state.requestedToken)

        return {
            isActive: state.isActive,
            offeror: state.offeror.toBase58(),
            offeredToken: state.offeredToken.toBase58(),
            offeredTokenAmount: state.offeredAmount.toNumber() / 10 ** offeredTokenDecimal,
            minRequestedAmount: state.minRequestedAmount.toNumber() / 10 ** requestedTokenDecimal,
            requestedToken: state.requestedToken.toBase58(),
            requestedTokenAmount: state.requestedAmount.toNumber() / 10 ** requestedTokenDecimal,
            // ratio: state.ratio,
        }

    }
    __getAllowTokenCheckAccount(token: web3.PublicKey): web3.PublicKey {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.SEED_ALLOWED_TOKEN, token.toBuffer(),
        ], this.programId)[0]
    }

    __getOfferStateAccount(
        offeror: web3.PublicKey,
        offeredToken: web3.PublicKey,
        requestedToken: web3.PublicKey,
        initTime: number,
    )
        : web3.PublicKey {
        const initTimeSeed = Buffer.from(new BN(initTime).toArray('le', 8));
        const offerStateAccount = web3.PublicKey.findProgramAddressSync([
            Seeds.SEED_OFFER,
            initTimeSeed,
            offeror.toBuffer(),
            offeredToken.toBuffer(),
            requestedToken.toBuffer(),
        ], this.programId)[0]
        return offerStateAccount;
    }

    async getTokenBalance(token: web3.PublicKey | string, user_address: web3.PublicKey | string) {
        if (typeof token == 'string') token = new web3.PublicKey(token)
        if (typeof user_address == 'string') user_address = new web3.PublicKey(user_address)

        const tokenAccount = getAssociatedTokenAddressSync(token, user_address);
        try {
            const res = await getTokenAccount(this.connection, tokenAccount);
            return parseInt(res.amount.toString())
        } catch {
            return 0
        }
    }

    async getTokenInfo(token: web3.PublicKey | string) {
        if (typeof token == 'string') token = new web3.PublicKey(token)

        try {
            const res = await getMint(this.connection, token)
            const decimals = res.decimals;
            const MPL_ID = new web3.PublicKey(MPL_PROGRAM_ID)
            const metadataAccount = web3.PublicKey.findProgramAddressSync(
                [
                    utf8.encode("metadata"),
                    MPL_ID.toBuffer(),
                    token.toBuffer(),
                ],
                MPL_ID
            )[0]

            try {
                const tokenMetadata = await Metadata.fromAccountAddress(this.connection, metadataAccount);
                return { name: tokenMetadata.data.name, decimals }
            } catch {
                //NAME NOT SET
                return { name: "", decimals }
            }
        } catch {
            throw "Token Not found"
        }
    }

    async _getTokenDecimal(token: web3.PublicKey | string) {
        if (typeof token == 'string') token = new web3.PublicKey(token)
        const cachedDecimal = this.cacheTokenDeciaml.get(token.toBase58())
        if (cachedDecimal) return cachedDecimal

        try {
            // log("getting tokne decimal")
            const tokenInfo = await getMint(this.connection, token);
            this.cacheTokenDeciaml.set(token.toBase58(), tokenInfo.decimals);
            return tokenInfo.decimals;
        }
        catch (e) {
            throw "Token Not found !"
        }
    }

    async initOfferState(
        offeror: web3.PublicKey,
        offeredToken: web3.PublicKey,
        requestedToken: web3.PublicKey,
    ): Promise<web3.PublicKey> {
        const initTime = Date.now();
        const offerStateAccount = this.__getOfferStateAccount(offeror, offeredToken, requestedToken, initTime);
        const offerStateAccountAta = getAssociatedTokenAddressSync(offeredToken, offerStateAccount, true);

        const offeredTokenAllowedChecker = this.__getAllowTokenCheckAccount(offeredToken);
        const requestedTokenAllowedChecker = this.__getAllowTokenCheckAccount(requestedToken);

        log("initalizeing acount")
        const ix = await this.program.methods.initOfferState(new BN(initTime)).accounts({
            offeror,
            offerStateAccount,
            offerStateAccountAta,
            offeredToken,
            requestedToken,
            offeredTokenAllowedChecker,
            requestedTokenAllowedChecker,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram,
        }).instruction()
        this.txis.push(ix)

        return offerStateAccount;
    }

    async _getAllProgramAccounts() {
        const res = await this.connection.getProgramAccounts(this.programId);
        let failedToDeriliazeAccounts = [];
        let offerAccounts: OfferInfo[] = []
        let allowTokenAccounts: { tokenId: string }[] = []
        for (let i of res) {
            const accountInfo = i.account;
            try {
                if (this.program.coder.accounts.size(IDL.accounts[2]) + 7 == accountInfo.data.length) {
                    const res = await this._parseOfferState(accountInfo.data, true, i.pubkey)
                    if (res == null) continue;
                    offerAccounts.push({ offerId: i.pubkey.toBase58(), data: res })
                } else {
                    const tokenId = this._parseAllowedTokenState(accountInfo.data, true, i.pubkey)
                    allowTokenAccounts.push({ tokenId })
                }

            } catch (e) {
                failedToDeriliazeAccounts.push(i.pubkey.toBase58())
            }
        }

        const mainRes = {
            offerAccounts,
            allowTokenAccounts,
            // failedToDeriliazeAccounts,
        }

        log(mainRes)
    }

    async createOffer(
        offeredToken: web3.PublicKey,
        requestedToken: web3.PublicKey,
        offeredTokenAmount: number,
        requestedTokenAmount: number,
        minRequestedAmount: number,
    ) {
        const offeror = this.wallet.publicKey;
        if (offeror == null) throw "Wallet not found"
        const offerorAta = getAssociatedTokenAddressSync(offeredToken, offeror);
        const feeReceiverAta = await this._getOrCreateTokenAccount(offeredToken, this.feeReceiver);
        const offerStateAccount = await this.initOfferState(
            offeror,
            offeredToken,
            requestedToken,
        );
        const offerStateAccountAta = getAssociatedTokenAddressSync(offeredToken, offerStateAccount, true)
        const offeredTokenAllowedChecker = this.__getAllowTokenCheckAccount(offeredToken);
        const requestedTokenAllowedChecker = this.__getAllowTokenCheckAccount(requestedToken);

        const offeredTokenDecimal = await this._getTokenDecimal(offeredToken);
        const requestedTokenDecimal = await this._getTokenDecimal(requestedToken);
        offeredTokenAmount = Connectivity.calculateNonDecimalValue(offeredTokenAmount, offeredTokenDecimal);
        requestedTokenAmount = Connectivity.calculateNonDecimalValue(requestedTokenAmount, requestedTokenDecimal);
        minRequestedAmount = Connectivity.calculateNonDecimalValue(minRequestedAmount, requestedTokenDecimal);

        const ix = await this.program.methods.createOffer(
            new BN(offeredTokenAmount), new BN(requestedTokenAmount), new BN(minRequestedAmount)).accounts({
                offeror,
                offerorAta,
                feeReceiverAta,
                mainStateAccount: this.mainStateAccount,
                offerStateAccount,
                offerStateAccountAta,
                offeredTokenAllowedChecker,
                requestedTokenAllowedChecker,
                tokenProgram: TOKEN_PROGRAM_ID,
            }).instruction()
        this.txis.push(ix)

        await this._sendTransaction();
    }

    async acceptOffer(
        offerId: web3.PublicKey,
        amount: number
    ) {
        const acceptor = this.wallet.publicKey;
        if (acceptor == null) throw "Wallet not found !"
        const offerState = await this.program.account.offerState.fetch(offerId)
        const offeror = offerState.offeror;
        const offeredToken = offerState.offeredToken;
        const requestedToken = offerState.requestedToken;
        const acceptorOfferedTokenAta = await this._getOrCreateTokenAccount(offeredToken, acceptor);
        const acceptorRequestedTokenAta = await this._getOrCreateTokenAccount(requestedToken, acceptor);
        const offerorRequestedTokenAta = await this._getOrCreateTokenAccount(requestedToken, offeror);

        const offerStateAccountAta = getAssociatedTokenAddressSync(offeredToken, offerId, true)
        const feeReceiverAta = await this._getOrCreateTokenAccount(requestedToken, this.feeReceiver);

        const requestedTokenDecimal = await this._getTokenDecimal(offerState.requestedToken);
        amount = Connectivity.calculateNonDecimalValue(amount, requestedTokenDecimal)

        const ix = await this.program.methods.acceptOffer(new BN(amount)).accounts({
            acceptor,
            acceptorOfferedTokenAta,
            acceptorRequestedTokenAta,
            offerorRequestedTokenAta,
            // offeredToken,
            // requestedToken,
            feeReceiverAta,
            mainStateAccount: this.mainStateAccount,
            offerStateAccount: offerId,
            offerStateAccountAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).instruction()

        this.txis.push(ix)

        await this._sendTransaction();
    }

    async editOffer(input: EditOfferInput) {
        const offeror = this.wallet.publicKey;
        if (offeror == null) throw "Wallet not found"

        // const offerorAta = getAssociatedTokenAddressSync(offeredToken, offeror);
        // const feeReceiverAta = await this._getOrCreateTokenAccount(offeredToken, this.feeReceiver);

        // const incOfferedTokenAmount = Connectivity.calculateNonDecimalValue(input.incOfferedTokenAmount, 9)
        // const decOfferedTokenAmount = Connectivity.calculateNonDecimalValue(input.decOfferedTokenAmount, 9)
        const offerStateAccountInfo = await this.connection.getAccountInfo(input.offerId);
        if (offerStateAccountInfo == null) throw 'offer not found !'
        const offerState = await this._parseOfferState(offerStateAccountInfo.data);
        const offeredToken = new web3.PublicKey(offerState.offeredToken)
        const requestedToken = new web3.PublicKey(offerState.requestedToken)

        const requestedTokenDecimal = await this._getTokenDecimal(requestedToken);
        const newRequestedTokenAmount = Connectivity.calculateNonDecimalValue(input.newRequestedTokenAmount, requestedTokenDecimal)
        const newMinRequestedTokenAmount = Connectivity.calculateNonDecimalValue(input.newMinRequestedTokenAmount, requestedTokenDecimal)

        const ix = await this.program.methods.editOffer(
            {
                // decOfferedTokenAmount: new BN(decOfferedTokenAmount),
                // decReceivedTokenAmount: new BN(decRequestedTokenAmount),
                // incOfferedTokenAmount: new BN(incOfferedTokenAmount),
                // incReceivedTokenAmount: new BN(incRequestedTokenAmount),

                newRequestedTokenAmount: new BN(newRequestedTokenAmount),
                newMinRequestedTokenAmount: new BN(newMinRequestedTokenAmount),
            },
        ).accounts({
            offeror,
            // offerorAta,
            // offeredToken,
            // requestedToken,
            // feeReceiverAta,
            mainStateAccount: this.mainStateAccount,
            offerStateAccount: input.offerId,
            // offerStateAccountAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).instruction()

        this.txis.push(ix)

        await this._sendTransaction();
    }

    async closeOffer(
        offerId: web3.PublicKey
    ) {
        const offeror = this.wallet.publicKey;
        if (offeror == null) throw "Wallet not found"

        const offerState = await this.program.account.offerState.fetch(offerId)
        const offeredToken = offerState.offeredToken;
        const requestedToken = offerState.requestedToken;
        const offerorAta = getAssociatedTokenAddressSync(offeredToken, offeror);
        const offerStateAccountAta = getAssociatedTokenAddressSync(offeredToken, offerId, true);

        log("Closing : ", offerId.toBase58())

        const ix = await this.program.methods.closeOffer().accounts({
            offeror,
            offerorAta,
            mainStateAccount: this.mainStateAccount,
            offerStateAccount: offerId,
            offerStateAccountAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).instruction()

        this.txis.push(ix)
        await this._sendTransaction();
    }

    //NOTE: Admin Calls
    async _allowToken(tokenId: web3.PublicKey | string) {
        const owner = this.wallet.publicKey
        if (owner == null) throw "Wallet not found !"
        if (typeof tokenId == 'string') tokenId = new web3.PublicKey(tokenId)
        const allowTokenStateAccount = this.__getAllowTokenCheckAccount(tokenId)

        const ix = await this.program.methods.allowToken().accounts({
            owner,
            token: tokenId,
            allowTokenStateAccount,
            mainState: this.mainStateAccount,
            systemProgram,
        }).instruction();
        this.txis.push(ix)

        await this._sendTransaction();
    }

    async _disAllowToken(tokenId: web3.PublicKey | string) {
        const owner = this.wallet.publicKey
        if (owner == null) throw "Wallet not found !"
        if (typeof tokenId == 'string') tokenId = new web3.PublicKey(tokenId)
        const allowTokenStateAccount = this.__getAllowTokenCheckAccount(tokenId)

        const ix = await this.program.methods.disallowToken().accounts({
            owner,
            token: tokenId,
            allowTokenStateAccount,
            mainState: this.mainStateAccount,
            systemProgram,
        }).instruction();
        this.txis.push(ix)

        await this._sendTransaction();

    }

    //NOTE: 
    async _listenEvents() {
        this.program.addEventListener(_EOfferCreatedName, (event: EOfferCreatedType, slot, signature) => {
            const parseValue = {
                offerId: event.offerId.toBase58(),
                offeror: event.offeror.toBase58(),
                offeredToken: event.offeredToken.toBase58(),
                offeredTokenAmount: event.offeredAmount.toNumber(),
                requestedToken: event.requestedToken.toBase58(),
                requestedTokenAmount: event.requestedAmount.toNumber(),
                minRequestedTokenAmount: event.minRequestedAmount.toNumber(),
            }
            log("event : ", { OfferCreated: parseValue });
        })

        this.program.addEventListener(_EOfferAcceptedName, (event: EOfferAcceptedType, slot, signature) => {
            const parseValue = {
                offerId: event.offerId.toBase58(),
                amount: event.amount.toNumber(),
            }
            log("event: ", { OfferAccepted: parseValue });
        })

        this.program.addEventListener(_EOfferUpdatedName, (event: EOfferUpdatedType, slot, signature) => {
            const parseValue = {
                offerId: event.offerId.toBase58(),
                newRequestedTokenAmount: event.newRequestedTokenAmount.toNumber(),
                newMinRequestedTokenAmount: event.newMinRequestedTokenAmount.toNumber(),
            }
            log("event: ", { OfferUpdated: parseValue });
        })

        this.program.addEventListener(_EOfferCompletedName, (event: EOfferCompletedType, slot, signature) => {
            log("event: ", { OfferCompleted: event.offerId.toBase58() });
        })

        this.program.addEventListener(_EOfferRevokedName, (event: EOfferRevokedType, slot, signature) => {
            log("event: ", { OfferRevoked: event.offerId.toBase58() });
        })

        this.program.addEventListener(_ETokenAllowedName, (event: ETokenAllowedType, slot, signature) => {
            log("event: ", { TokenAllowed: event.tokenId.toBase58() });
        })

        this.program.addEventListener(_ETokenDisAllowedName, (event: ETokenDisAllowedType, slot, signature) => {
            log("event: ", { TokenDisAllowed: event.tokenId.toBase58() });
        })
    }
}
