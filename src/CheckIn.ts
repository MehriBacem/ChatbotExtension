  import { APIGatewayEvent, Context, ProxyCallback } from "aws-lambda";
  import { verifyXHubChallenge, sendMessage} from "./helper";
  import config from "./config";
  var Client = require('node-rest-client').Client;



  var username = '<API Username>';
  var apiKey = '<API KEY>';
  var fxmlUrl = 'https://flightxml.flightaware.com/json/FlightXML3/'

  var client_options = {
      user: username,
      password: apiKey
  };
  var client = new Client(client_options);

  client.registerMethod('flightstatus', fxmlUrl + 'FlightInfoStatus', 'GET');


  export default async function handler(event: APIGatewayEvent, context: Context, callback?: ProxyCallback) {
      console.log(JSON.stringify(event));
      if (!verifyXHubChallenge(event.headers["x-hub-signature"], event.body, config.secret)) {
          console.log(`wrong signature ${event.headers["x-hub-signature"]}`);
          return callback(null, { statusCode: 401, body: JSON.stringify({
              error: "x-hub-signature didn't match!",
          })});
      }
      const { dialogFlow, facebookUser, facebookPage } = JSON.parse(event.body);

      if (dialogFlow.action !== "CheckIn") {
          return callback(null, { statusCode: 200, body: JSON.stringify("response")});
          };

          var findFlightArgs = {
      parameters: {
          ident: dialogFlow.parameters.any
          
      }
  };
            
    await  client.methods.flightstatus(findFlightArgs, async function(data:any,res:any){
         
                
       var result = data.FlightInfoStatusResult.flights[0];
        const DepartureDate = result.filed_departure_time.date;
        const newDepartureDate = DepartureDate.split("/").reverse().join("-");
        const ArrivalDate= result.filed_arrival_time.date;
        const newArrivalDate = ArrivalDate.split("/").reverse().join("-");
        const DepartureTime = result.filed_departure_time.time.substring(0,5);
         const ArrivalTime = result.filed_arrival_time.time.substring(0,5);

           const response = await sendMessage(config.moduleAccessToken, facebookPage.pageId, [{
          sender: {
              id: facebookPage.pageId
          },
          recipient: {
              id: facebookUser.pageScopedId
          },
          message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "airline_checkin",
          "intro_message": "Check-in is available now.",
          "locale": "en_US",        
          "pnr_number": "ABCDEF",
          "checkin_url": "https:\/\/www.airline.com\/check-in",  
          "flight_info": [
            {
              "flight_number": `${result.flightnumber}`,
              "departure_airport": {
                "airport_code": `${result.origin.code}`,
                "city": `${result.origin.city}`
              },
              "arrival_airport": {
                "airport_code": `${result.destination.code}`,
                "city":  `${result.destination.city}`
              },
              "flight_schedule": {
                "departure_time": `${newDepartureDate}T${DepartureTime}`,
                "arrival_time": `${newArrivalDate}T${ArrivalTime}`
              }
            }
          ]
        }
      }
    }
      }]);

      console.log(`${response.status} ${JSON.stringify(await response.json())}`);
      return callback(null, { statusCode: 200, body: JSON.stringify("response")});
            
  });
  }

