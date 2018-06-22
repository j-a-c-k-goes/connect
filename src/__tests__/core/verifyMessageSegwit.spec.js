import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

const verifySubtest = (): void => {
    const testPayloads = [
        {
            // trezor pubkey - OK
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be00',
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message!',
        },
    ];

    const expectedResponses = [
        { success: true },
        { success: false },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verify',
    };
};

const verifyLongSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '245ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed',
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];

    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyLong'
    };
};

const verifyTestnetSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Testnet',
            address: '2N4VkePSzKH2sv5YBikLHGvzUYvfPxV6zS9',
            signature: '249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
    ];

    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyTestnet'
    };
};

const verifyUtfSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '24d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            message: 'P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f',
        },
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: '24d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            message: 'P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f',
        },
    ];
    const expectedResponses = [
        { success: true },
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyUtf',
    };
};

export const verifyMessageSegwitTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        verify: verifySubtest,
        verifyLong: verifyLongSubtest,
        verifyTestnet: verifyTestnetSubtest,
        verifyUtf: verifyUtfSubtest,
    };

    describe('VerifyMessageSegwit', () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const { testPayloads, expectedResponses, specName } = availableSubtests[subtest]();
        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};