const electron = require('electron');
      const {ipcRenderer} = electron;
      const $ = require('jquery');

	  const movieTable = document.getElementById('tableBody');

	  ipcRenderer.on("showUsername", (e, username) => {
		const msg = document.getElementById('welcomeMsg')
		msg.innerHTML = username+"'s Movies:"
	  })


      ipcRenderer.on('item:add', function(e,items)
        {
        items.forEach(function(item){
			const tr = document.createElement('tr');

			tdID = document.createElement('td')
			itemText = document.createTextNode(item.movieID);
			tdID.appendChild(itemText);
			tr.appendChild(tdID);

			if(item.imageLink !==null){
				itemImage = new Image();
				itemImage.src = item.imageLink;
				itemImage.style.width = '100px';
				td1 = document.createElement('td')
				td1.appendChild(itemImage);
			}
			
			tr.appendChild(td1)
			
			td2 = document.createElement('td')
			itemText = document.createTextNode(item.title);
			td2.appendChild(itemText);
			tr.appendChild(td2);
			
			td3 = document.createElement('td')
			itemText = document.createTextNode(item.genre);
			td3.appendChild(itemText);
			tr.appendChild(td3);
			
			td4 = document.createElement('td')
			itemText = document.createTextNode(item.rating);
			td4.appendChild(itemText);
			tr.appendChild(td4);
			
			td5 = document.createElement('td')
			itemText = document.createTextNode(item.review);
			td5.appendChild(itemText);
			tr.appendChild(td5);


			td6 = document.createElement('td');
			editBtn = document.createElement('button');
			editBtn.setAttribute('class','btn btn-dark mr-3');
			editBtn.textContent = 'edit';
			editBtn.addEventListener('click', function(e){
				ipcRenderer.send('item:search', item.movieID);
			})
			td6.appendChild(editBtn);

			deleteBtn = document.createElement('button');
			deleteBtn.setAttribute('class','btn btn-dark');
			deleteBtn.textContent = 'delete';
			deleteBtn.addEventListener('click', function(e){
				ipcRenderer.send('item:delete', item.movieID);
			})
			td6.appendChild(deleteBtn);
			
			tr.appendChild(td6);
			
			movieTable.appendChild(tr);
			
		})
      
      });


      ipcRenderer.on('item:clear', function(){
        movieTable.innerHTML = '';
      });