'use strict';

const apiKey = 'SMo2NaWq3fn0klN72N9IOrWxwUAb6Rep9GG7QFhH5ppB8WXlY1';
const secret = 'aMBB9pMhLbcrkNAjwoGjHz8Tp3vEshJ7Mb8KSZBh';
let token = '';

//to request an access token
function getToken(){
    fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${secret}`,
         headers: {
           "Content-Type": "application/x-www-form-urlencoded"        
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        token=data;
    });
}

$(getToken);