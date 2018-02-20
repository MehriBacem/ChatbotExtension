import * as  crypto from 'crypto';
import fetch, { Response } from "node-fetch";
import * as moment from "moment";
import config from './config';



export const verifyXHubChallenge = (challenge: string, body: string, secret: string) => {
    return ("sha1=" + crypto.createHmac("sha1", secret).update(body, "utf8").digest("hex")) === challenge;
};

export async function sendMessage(moduleAccessToken: string, pageId: string, messages: any[]): Promise<Response> {
    console.log(pageId, JSON.stringify(messages));
    return await fetch(`${config.chatbotmanUrl}facebookApi/sendMessage`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            moduleAccessToken,
            pageId,
            messages,
        }),
    });
}

        
