'use strict';

function displayResults(responseJson){
    console.log(responseJson);
    for(let element of responseJson.animals){
        for(let picElement of element.photos){
            $('.js-results-list').append(
                `<li class="box">
                    <img src="${picElement.full}" alt="animal" class="pet-img">
                    <h3>${element.name}</h3>
                    <p>${element.gender} | ${element.age}</p>
                    <p>${element.breeds.primary}</p>
                    <div id="${element.id}" class="modal">
                        <h1>My name is ${element.name}!</h1>  
                        <img src="${picElement.full}" alt="animal" class="pet-img">
                        <h2>Facts About Me</h2>
                        <ul>
                            <li>Breed: ${element.breeds.primary}</li>
                            <li>Age: ${element.age}</li>
                            <li>Size: ${element.size}</li>
                            <li>Sex: ${element.gender}</li>
                            <li>Location: ${element.contact.address.city}, ${element.contact.address.state}</li>
                        </ul>
                        <a href="${element.url}"><button>Adopt me!</button></a>
                    </div> 
                    <p><a href="#${element.id}" rel="modal:open">Meet Me</a></p>
                </li>`  
            ); 
        }
    } 
}

function getAvailablePets(location,pet,distance){
    let url = `https://api.petfinder.com/v2/animals?type=${pet}&location=${location}&distance=${distance}`;
    console.log(url);
    const options = {
        headers:{
            Authorization: `Bearer ${token.access_token}`}
    };
   
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

function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      $('.js-results-list').empty();
      const location = $('#location').val();
      const pet = $('#pets').val();
      const distance = $('#distance').val();
      getAvailablePets(location,pet,distance);
    });
  }

  $(watchForm);