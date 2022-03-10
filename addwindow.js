const electron = require('electron')
const {ipcRenderer} = electron
const Joi = require('joi');


const movieSchema = Joi.object({
  title: Joi.string().min(1).required(),
  genre: Joi.string().required(),
  rating: Joi.number().min(1).required(),
  review: Joi.string().allow(''),
  imageLink: Joi.string().allow('')
})
    
  const form = document.getElementById('addform');
  form.addEventListener('submit', submitAddForm);

  function submitAddForm(e) {
    e.preventDefault();
    const title = document.querySelector('#title').value;
    const genre = document.querySelector('#genre').value;
    const rating = parseInt(document.querySelector('#rating').value);
    const review = document.querySelector('#review').value;
    const imageLink = document.querySelector('#imageLink').value;
    
    const result = movieSchema.validate({title: title, genre: genre, rating: rating, review: review, imageLink: imageLink})

    if(!result.error) {
        ipcRenderer.send('item:add',title,genre,rating,review,imageLink);
      }
}

