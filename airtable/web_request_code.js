
const axios = require('axios');


//getResponseCode("https://nightfall.ai")


origin_url = "https://nightfall.ai/"


url = axios.get(origin_url)
.then(function (response) { 
    Promise.resolve(response)

    parsed_response = new URL(response.request.res.responseUrl)
    parsed_origin = new URL(origin_url)


    if (parsed_response.hostname.valueOf() != parsed_origin.hostname.valueOf()) {
        console.log("Redirected!")
        console.log(parsed_response.hostname + " != " + parsed_origin.hostname)
    } else {
        console.log("Not redirected!")
    }
  }
).catch((error) => console.log(error));



function getResponseCode(url) {
    return new Promise((resolve, reject) => {
        axios(postRequest).then(function (response) {
            var result = response['data']['tasks'];
            var serp = new Serp(result);
            resolve(serp.getUrls());
        }).catch(function (error) {
            console.log(error);
        });
    })
}
