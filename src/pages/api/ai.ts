import { NextApiRequest, NextApiResponse } from 'next';
import { ChatGPTAPI } from 'chatgpt';
import { ChatClient } from '@walletconnect/chat-client';
import { ethers } from 'ethers';

const alch = new ethers.providers.AlchemyProvider('homestead', process.env.ALCH_KEY!);
const signer = new ethers.Wallet(process.env.PRIV_KEY!, alch);

const gpt = new ChatGPTAPI({
  apiKey: process.env.GPT_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatClient = await ChatClient.init({
    projectId: '3371f2e9a8e5b1fdee34a37303058c38',
    keyserverUrl: 'https://keys.walletconnect.com',
  });

  await chatClient
    .register({
      account: 'eip155:1:' + signer.address,
      onSign: async (message) => {
        return await signer
          .signMessage(message)
          .then((signature) => {
            return signature;
          })
          .catch((e) => {
            console.log('failed to sign message: ' + e);
            return '';
          });
      },
    })
    .then((res) => {
      console.log('registered client: ' + res);
    })
    .catch((e) => {
      console.log('failed to register client: ' + e);
    });

  chatClient.on('chat_invite', async (event) => {
    console.log('chat_invite', event);
    await chatClient.accept({
      id: event.id,
    });
  });

  chatClient.on('chat_message', async (event) => {
    console.log('chat_message', event);
    const response = await gpt.sendMessage(event.params.message);
    await chatClient.message({
      topic: event.topic,
      message: response.text as string,
      authorAccount: 'eip155:1:' + signer.address,
      timestamp: Date.now(),
    });
  });

  chatClient.on('chat_left', async (event) => {
    console.log('chat_left', event);
  });

  res.status(200).json({ id: 'eip155:1:' + signer.address });
}
