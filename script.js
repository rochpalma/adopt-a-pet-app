'use strict';

const mapApiKey = "AIzaSyDDp2Nt05EGsz8H3sFtmRAcHxLC_r17W5Q";
let petArr = [];
let searchLocation = "";

//call PetFinder API
function getAvailablePets(location,pet,distance){
    let url = `https://api.petfinder.com/v2/animals?type=${pet}&location=${location}&distance=${distance}&limit=50`;
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

//display the pet details
function displayResults(responseJson){
    let petImg = "";
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
                <a href="#${key}" rel="modal:open"><img src="${petImg}" alt="${element.name} picture" class="pet-img"></a>
                <div class="profile-container">
                    <h3>${element.name}</h3>
                    <p>${element.gender} | ${element.age}</p>
                    <p>${element.breeds.primary}</p>
                    <p>${element.contact.address.city}, ${element.contact.address.state}</p>
                    <p><a href="#${key}" rel="modal:open" class="btn">Meet Me</a></p>
                </div>
                <div id="${key}" class="modal">
                    <h1>My name is ${element.name}!</h1>  
                    <img src="${petImg}" alt="animal" class="pet-img">
                    <ul>
                        <li><span class="label">Breed:</span> ${element.breeds.primary}</li>
                        <li><span class="label">Age:</span> ${element.age}</li>
                        <li><span class="label">Size:</span> ${element.size}</li>
                        <li><span class="label">Gender:</span> ${element.gender}</li>
                        <li><span class="label">Location:</span> ${element.contact.address.city}, ${element.contact.address.state}</li>
                    </ul>
                    <div id="${element.id}" class="map">
                    </div>
                    <div class="btn-container">
                        <a href="${element.url}#petInquiry" target="_blank" class="btn">Adopt me!</a>
                    </div>
                </div> 
            </li>`  
        ); 
    }                    
    console.log(petArr);
}

//get the index of the selected pet
function petClicked(){
    $('.js-results-list').on('click','a', function(){
        let index = $(this).attr('href').substring(1);
        $('.js-error').empty();
        console.log('pet index of selected pet: ' + index);
        searchLocation = "";
        petClickedInfo(index);
    }); 
}

//retrieve the location details of the selected pet to be able to display the map in the modal
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

//get the shelter name value
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
        console.log("shelter name is " + shelterName);
        getGeoLocation(shelterName,mapID);
    })
    .catch(err => {
        $('.js-error').text(`Something went wrong with the address. Please try again.`);
    });
}

//format location to make the proper syntax for geocode parameter
function formatLocationQuery(address,city,state) {
    let locationArr = [];
        if(address !== null) {
            locationArr.push(address.split(' ').join('+'));
        }
        locationArr.push(city.split(' ').join('+'));
        locationArr.push(state.split(' ').join('+'));
        searchLocation = locationArr.join("+");
  }

//call geocode api
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

  //get the coordinates
function getCoord(responseJson,shelterName,mapID){
    let petLat, petLng;
    petLat = responseJson.results[0].geometry.location.lat;
    petLng = responseJson.results[0].geometry.location.lng;
    initMap(petLat,petLng,shelterName,mapID);
    console.log(petLat + " and " + petLng);
}

//load map with a marker and displays the shelter name
function initMap(petLat,petLng,shelterName,mapID){
    let map = new google.maps.Map(document.getElementById(mapID),{
        zoom: 10,
        center: new google.maps.LatLng(petLat, petLng)
    })
    let marker = new google.maps.Marker({
        position: {lat: petLat, lng: petLng},
        map: map,
        animation: google.maps.Animation.DROP,
        title: 'Pet Shelter'
    });
    let infowindow = new google.maps.InfoWindow({ 
        content: shelterName,
    });
    infowindow.open(map, marker);  
  }

  //event handler for submit button on adopt page screen
function watchForm(){
    $('form').submit(event => {
      event.preventDefault();
      $('.empty').remove();
      $('.js-results-list').empty();
      $('.js-error').empty();
      petArr = [];
      const location = $('#location').val();
      const pet = $('#pets').val();
      const distance = $('#distance').val();
      getAvailablePets(location,pet,distance);
    });
  }

  $(watchForm);
  $(petClicked);
