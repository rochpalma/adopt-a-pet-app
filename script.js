'use strict';

const mapApiKey = "AIzaSyDDp2Nt05EGsz8H3sFtmRAcHxLC_r17W5Q";

let petArr = [];
let searchLocation = "";

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
        $('.js-error').text(`Something went wrong. Please try searching pets again.`);
    });
}

function displayResults(responseJson){
    let petImg = "";
    console.log(responseJson);
    for(let [key,element] of responseJson.animals.entries()){
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
                <div id="${key}" class="modal">
                    <h1>My name is ${element.name}!</h1>  
                    <img src="${petImg}" alt="animal" class="pet-img">
                    <h2>Facts About Me</h2>
                    <ul>
                        <li>Breed: ${element.breeds.primary}</li>
                        <li>Age: ${element.age}</li>
                        <li>Size: ${element.size}</li>
                        <li>Gender: ${element.gender}</li>
                        <li>Location: ${element.contact.address.city}, ${element.contact.address.state}</li>
                    </ul>
                    <div id="${element.id}" class="map">
                    </div>
                    <a href="${element.url}" target="_blank"><button>Adopt me!</button></a>
                </div>
                <p><a href="#${key}" rel="modal:open">Meet Me</a></p>
            </li>`  
        ); 
    }
    console.log(petArr);
}

function petClicked(){
    $('.js-results-list').on('click','a', function(){
        let index = $(this).attr('href').substring(1);
        $('.js-error').empty();
        console.log('pet index of selected pet: ' + index);
        searchLocation = "";
        petClickedInfo(index);
    }); 
}

function petClickedInfo(index){
    let address = "";
    let city = "";
    let state = "";
    let orgID = "";
    let mapID = "";
    address = petArr[index].contact.address.address1;       
    city = petArr[index].contact.address.city;
    state = petArr[index].contact.address.state;
    orgID = petArr[index].organization_id;
    mapID = petArr[index].id;  
    formatLocationQuery(address,city,state);
    getShelterName(orgID,mapID);  
}

function getShelterName(shelterID,mapID){
    let url = `https://api.petfinder.com/v2/organizations/${shelterID}`;
    let shelterName = "";
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
        shelterName = responseJson.organization.name;
        console.log(responseJson);
        console.log("shelter name is " + shelterName);
        getGeoLocation(shelterName,mapID);
    })
    .catch(err => {
        $('.js-error').text(`Something went wrong with the address. Please try again.`);
    });
}

function formatLocationQuery(address,city,state) {
    let locationArr = [];
        if(address !== null) {
            locationArr.push(address.split(' ').join('+'));
        }
        locationArr.push(city.split(' ').join('+'));
        locationArr.push(state.split(' ').join('+'));
        searchLocation = locationArr.join("+");
  }

function getGeoLocation(shelterName,mapID) {
    let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchLocation}&key=${mapApiKey}`;
    console.log(url);
    fetch(url)
    .then(response => {
    if (response.ok) {
        return response.json();
    }
        throw new Error(response.statusText)
    })
    .then(responseJson => getCoord(responseJson,shelterName,mapID))
    .catch(err => {
        console.log(err);
        $('.js-error').text(`Something went wrong.`)
    });
  }


function getCoord(responseJson,shelterName,mapID){
    let petLat, petLng;
    petLat = responseJson.results[0].geometry.location.lat;
    petLng = responseJson.results[0].geometry.location.lng;
    initMap(petLat,petLng,shelterName,mapID);
    console.log(responseJson);
    console.log(petLat + " and " + petLng);
}

function initMap(petLat,petLng,shelterName,mapID){
    console.log("currShelter value is " + shelterName);
    let map = new google.maps.Map(document.getElementById(mapID),{
        zoom: 10,
        center: new google.maps.LatLng(petLat, petLng)
    })
    let marker = new google.maps.Marker({
        position: {lat: petLat, lng: petLng},
        map: map,
        title: 'Pet Shelter'
    });
    let infowindow = new google.maps.InfoWindow({ 
        content: shelterName,
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
