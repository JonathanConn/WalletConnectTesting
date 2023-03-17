import Client, { ChatClient } from "@walletconnect/chat-client";
import { useEffect, useState } from "react";
import { useAccount, useContract, useSigner } from 'wagmi'
import { signMessage } from '@wagmi/core'

export function ChatModal() {
    const [client, setClient] = useState<Client>();
    const [topic, setTopic] = useState<string>('');
    const [msg, setMsg] = useState<string>('');

    const [messages, setMessages] = useState<string[]>([]);

    const { address, isConnected } = useAccount();

    const serverId = 'eip155:1:0xB0Ee2f94f0680d6131316d6056Dcf5827Abe492B';

    useEffect(() => {

        // create client + register address
        async function init() {

            // start chat server
            await fetch('/api/ai');

            // start local chat client
            const client = await ChatClient.init({
                projectId: "3371f2e9a8e5b1fdee34a37303058c38",
                keyserverUrl: "https://keys.walletconnect.com",
            });
            
            client.on("chat_invite_accepted", async (event) => {                
                setTopic(event.params.topic);
            });            
            client.on("chat_message", async (event) => {                
                setMessages([...messages, event.params.message]);
            });
                            
            await client.register({
                account: `eip155:1:${address}`,
                onSign: async (message) => {
                    const sign = signMessage({
                        message,
                    });
                    return sign;
                }
            });

            const inviteePublicKey = await client.resolve({ account: serverId })
            await client.invite({
                message: "Hello server",
                inviterAccount: `eip155:1:${address}`,
                inviteeAccount: serverId,
                inviteePublicKey,
            })
            setClient(client);
        }

        if (!client && isConnected && address) {
            init();
        }

    }, [address, client, isConnected]);

    async function sendMsg() {
        await client?.message({
            topic,
            message: msg,
            authorAccount: `eip155:1:${address}`,
            timestamp: Date.now(),
        })
            .then(() => {
                setMessages([...messages, msg]);
                setMsg('');
                // console.log(client.chatMessages.getAll());
            })
            .catch(e => { console.error('failed to send message', e) });
    }

    return (
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100 card-bordered">
            <div className="card-body items-center">

                {/* Messages */}
                <div>
                    {messages.map((msg, i) => {
                        return <p key={i}>{msg}</p>
                    })
                    }
                </div>

                {/* Input */}
                <div className="form-control">
                    <label className="input-group">
                        <input type="text" id="msgInput"
                            placeholder="Type your messege"
                            className="input input-bordered"
                            onChange={(msg) => { setMsg(msg.target.value) }}
                            value={msg}
                        />
                        <button
                            className="btn btn-circle bg-blue-600 text-white border-none"
                            onClick={() => sendMsg()}
                        >
                            <p>Send </p>
                        </button>
                    </label>
                </div>


            </div>
        </div>
    );
}
