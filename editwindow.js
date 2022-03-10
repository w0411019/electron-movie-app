const {ipcRenderer} = require('electron')
const knex = require("knex")({
    client: "sqlite3",
    connection:{
        filename:"./dbmovie.db"
    },
    useNullAsDefault: true
});
const Joi = require('joi');

const updateButton = document.getElementById("updateButton");
updateButton.addEventListener('click', updateMovie);

const movieSchema = Joi.object({
	title: Joi.string().min(1).required(),
	genre: Joi.string().required(),
	rating: Joi.number().min(1).required(),
	review: Joi.string().allow(''),
	imageLink: Joi.string().allow('')
  })


function updateMovie(){
        let itemInfo = [];
		
		itemInfo.push(document.getElementById('movieFound').value); 	
		itemInfo.push(document.getElementById('title').value); 
		itemInfo.push(document.getElementById('genre').value); 
		itemInfo.push(document.getElementById('rating').value);
        itemInfo.push(document.getElementById('review').value); 
        itemInfo.push(document.getElementById('imageLink').value);

		const result = movieSchema.validate({title: itemInfo[1], genre: itemInfo[2], rating: itemInfo[3], review: itemInfo[4], imageLink: itemInfo[5]})

		if(!result.error) {
			ipcRenderer.send('item:edit',itemInfo);
		  }
}

ipcRenderer.on('item:found', (event, rows) => {
	rows.forEach(function(row){
		console.log(rows)
		document.getElementById('movieFound').value = row.movieID; 	
		document.getElementById('title').value = row.title; 
		document.getElementById('genre').value = row.genre; 
		document.getElementById('rating').value = row.rating; 
        document.getElementById('review').value = row.review; 
        document.getElementById('imageLink').value = row.imageLink; 
	})
})



