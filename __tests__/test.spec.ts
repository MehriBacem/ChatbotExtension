import wrap from "../src/wrapLambda";
import CheckIn from "../src/CheckIn";
import * as helper from "../src/helper";

const lambda = wrap(CheckIn);

describe("HelloWorld Unit test", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return 401 if x-hub-signature does not match", async () => {
        const mockEvent = {
            "httpMethod": "POST",
            "headers": {
                "content-type": "application/json",
                "x-hub-signature": "sha1=a13ce08929b1d9e237a4793935febacb116d1bfe"
            },
            "body": "{\"pageId\":\"246969682484713\",\"psId\":\"1581856468561377\",\"action\":\"GIVE_ME_FIVE\",\"parameters\":{},\"contexts\":[]}",
        };
        const response = await lambda.run(mockEvent);
        expect(response.statusCode).toBe(401);
    });

    it("should send message to chatbotman api", async () => {
        const mockEvent = {
            "httpMethod": "POST",
            "headers": {
                "x-hub-signature": "sha1=a13ce08929b1d9e237a4793935febacb116d1bfe"
            },
            "body": "{\"dialogFlow\":{\"action\":\"CheckIn\",\"parameters\":{}},\"facebookPage\":{\"pageId\":\"246969682484713\",\"name\":\"Test\",\"pictureUrl\":\"https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/20229077_246969729151375_1782914393777762448_n.png?oh=a955d6f574578855f0f19f7f0ab0ba99&oe=5AD8769D\"},\"facebookUser\":{\"preferredLanguage\":\"en-US\",\"pageScopedId\":\"1581856468561377\",\"name\":\"My name\",\"firstName\":\"My first name\",\"lastName\":\"my last name\",\"gender\":\"male\",\"timezone\":\"8\",\"subscribed\":false,\"profile_pic\":\"my profile_pic\",\"locale\":\"en_US\"}}",
        };
        const mockSendMessage = jest.spyOn(helper, "sendMessage").mockReturnValue({json: async () => { 
        }});

        const mockVerifyXHubChallenge = jest.spyOn(helper, "verifyXHubChallenge").mockReturnValue(true);
        const response = await lambda.run(mockEvent);
        expect(response.statusCode).toBe(200);
        
    });
    });