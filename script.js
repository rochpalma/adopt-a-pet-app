'use strict';

const mapApiKey = "AIzaSyDDp2Nt05EGsz8H3sFtmRAcHxLC_r17W5Q";

let petArr = [];
let searchLocation = "";
//let shelterName = "";

/*let petLat = -25.344;
let petLng = 131.036;*/


function getAvailablePets(location,pet,distance){
    let url = `https://api.petfinder.com/v2/animals?type=${pet}&location=${location}&distance=${distance}`;
    console.log(url);
    const options = {
        headers: new Headers({
            Authorization: `Bearer ${token.access_token}`
        })
    }
   
    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
        $('.js-error').text(`Something went wrong. Please try again.`);
    });
}

function displayResults(responseJson){
    let petImg = "";
    console.log(responseJson);
    for(let element of responseJson.animals){
        petArr.push(element);
        
        if(element.photos.length == 0){
            petImg = "images/img-not-available.jpg";
        }
        else{
            petImg = element.photos[0].full;
        }
        $('.js-results-list').append(
            `<li class="box">
                <img src="${petImg}" alt="animal" class="pet-img">
                <h3>${element.name}</h3>
                <p>${element.gender} | ${element.age}</p>
                <p>${element.breeds.primary}</p>
                <div id="${element.id}" class="modal">
                    <h1>My name is ${element.name}!</h1>  
                    <img src="${petImg}" alt="animal" class="pet-img">
                    <h2>Facts About Me</h2>
                    <ul>
                        <li>Breed: ${element.breeds.primary}</li>
                        <li>Age: ${element.age}</li>
                        <li>Size: ${element.size}</li>
                        <li>Sex: ${element.gender}</li>
                        <li>Location: ${element.contact.address.city}, ${element.contact.address.state}</li>
                    </ul>
                    <div id="map">
                    </div>
                    <a href="${element.url}"><button>Adopt me!</button></a>
                </div>
                <p><a href="#${element.id}" rel="modal:open">Meet Me</a></p>
            </li>`  
        ); 
    }
    console.log(petArr);
}

function petClicked(){
    $('.js-results-list').on('click','a', function(){
        let id = $(this).attr('href').substring(1);
        console.log('pet id of selected pet: ' + id);
        petClickedInfo(id);
    }); 
}

function petClickedInfo(petID){
    let address = "";
    let city = "";
    let state = "";
    for (let element of petArr) {
        if (element.id == petID) {
            if(element.contact.address.address1 !== null){
                address = element.contact.address.address1;
            }
            city = element.contact.address.city;
            state = element.contact.address.state;
            console.log("org "+ element.organization_id);
            formatLocationQuery(address,city,state);
            getShelterName(element.organization_id);
            //getGeoLocation();
            //initMap();
            break;
        }
     }
}

function getShelterName(shelterID){
    let url = `https://api.petfinder.com/v2/organizations/${shelterID}`;
    console.log(url);
    const options = {
        headers: new Headers({
            Authorization: `Bearer ${token.access_token}`
        })
    }
    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        let shelterName = responseJson.organization.name;
        console.log(responseJson);
        console.log("shelter name is " + shelterName);
        getGeoLocation(shelterName);
    })
    .catch(err => {
        $('.js-error').text(`Something went wrong with the address. Please try again.`);
    });
}

// format location for geocode parameter
function formatLocationQuery(address,city,state) {
    let locationArr = [];
        if(address !== null) {
            locationArr.push(address.split(' ').join('+'));
        }
        locationArr.push(city.split(' ').join('+'));
        locationArr.push(state.split(' ').join('+'));
        searchLocation = locationArr.join("+");
  }

function getGeoLocation(shelterName) {
    let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchLocation}&key=${mapApiKey}`;
    searchLocation = "";
    console.log(url);
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText)
      })
      .then(responseJson => {
        let petLat = responseJson.results[0].geometry.location.lat;
        let petLng = responseJson.results[0].geometry.location.lng;
        initMap(petLat,petLng,shelterName);
        console.log(responseJson);
        console.log(petLat + " and " + petLng);
      })
      .catch(err => {
        $('.js-error').text(`Something went wrong. Please try again.`)
      });
  }

function initMap(petLat,petLng,shelterName) {
    let coord = {
        lat: petLat, 
        lng: petLng
    };
    let mapOption = {
        zoom: 12,
        center: new google.maps.LatLng(petLat, petLng)
    };
    //let map = new google.maps.Map(document.getElementById('map'), mapOption);
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 40,
        center: coord,
        //animation: google.maps.Animation.DROP//added
        
      });
    
    let infowindow = new google.maps.InfoWindow({
        content: shelterName
    });
    let marker = new google.maps.Marker({
       // position: new google.maps.LatLng(petLat, petLng),
        position: coord,
        map: map
    });
    infowindow.open(map, marker);
  }

function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      $('.js-results-list').empty();
      petArr = [];
      const location = $('#location').val();
      const pet = $('#pets').val();
      const distance = $('#distance').val();
      getAvailablePets(location,pet,distance);
    });
  }

  $(watchForm);
  $(petClicked);