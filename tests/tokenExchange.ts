import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TokenExchange } from "../target/types/token_exchange";

describe("Adming Calls", () => {
    anchor.setProvider(anchor.AnchorProvider.env());

    const provider = anchor.AnchorProvider.env()
    const owner = provider.publicKey;
    const program = anchor.workspace.TokenExchange as Program<TokenExchange>;
    const programId = program.programId;
    const log = console.log;
    const Seeds = {
        SEED_MAIN_STATE: utf8.encode("main_state"),
        SEED_ALLOWED_TOKEN: utf8.encode("allowed_token1"),
        SEED_OFFER: utf8.encode("offer4"),
    }
    const mainStateAccount = web3.PublicKey.findProgramAddressSync([Seeds.SEED_MAIN_STATE], programId)[0];
    const feeReceiver = new web3.PublicKey("2JBAzzmqZwgi9MjKXsQehtcZyUrTta5jdxSiAi8onaaZ")

    function calcNonDecimalValue(value: number, decimal: number): number {
        return Math.trunc(value * (10 ** decimal));
    }

    function __getAllowTokenCheckAccount(token: web3.PublicKey): web3.PublicKey {
        return web3.PublicKey.findProgramAddressSync([
            Seeds.SEED_ALLOWED_TOKEN, token.toBuffer(),
        ], programId)[0]
    }


    // it("main state initialized!", async () => {
    //     const feeRate = new anchor.BN(calcNonDecimalValue(0.25, 6))
    //     let res = await program.methods.initMainState(
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

    // it("update main state", async () => {
    //     const feeRate = new anchor.BN(calcNonDecimalValue(0.25, 6))
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

    it("Allowed token", async () => {
        const a = new web3.PublicKey("D8jzT2tFPoneyG8vXer6Krw1hCfXrAWCAAKUqfMp9QC3")
        const b = new web3.PublicKey("Aeau4hdegEeFL26NACXZoXJVmJam99tdPk3VQKNtYdxf")
        const current = b;
        const allowTokenStateAccount = __getAllowTokenCheckAccount(current);

        const res = await program.methods.allowToken().accounts({
            owner,
            mainState: mainStateAccount,
            systemProgram: web3.SystemProgram.programId,
            allowTokenStateAccount,
            token: current,
        }).rpc();
        log("Res: ", res);
    })

    //     it("DisAllow token: ", async () => {
    //         const a = new web3.PublicKey("D8jzT2tFPoneyG8vXer6Krw1hCfXrAWCAAKUqfMp9QC3")
    //         const b = new web3.PublicKey("Aeau4hdegEeFL26NACXZoXJVmJam99tdPk3VQKNtYdxf")
    //         const current = b;
    //         const allowTokenStateAccount = __getAllowTokenCheckAccount(current);
    //         log("DisAllow token state: ", allowTokenStateAccount.toBase58())

    //         const res = await program.methods.disallowToken().accounts({
    //             owner,
    //             mainState: mainStateAccount,
    //             systemProgram: web3.SystemProgram.programId,
    //             allowTokenStateAccount,
    //             token: current,
    //         }).rpc();

    //     })

    // it("Fetch main state ", async () => {
    //     const res = await program.account.mainState.fetch(mainStateAccount);
    //     log("MainState :", res);
    // })

});
