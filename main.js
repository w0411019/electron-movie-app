
const path = require('path');
const url = require('url');
let sqlite3 = require('sqlite3');
const Settings = require('./settings.js');
let knex = require('knex') ({
	client: "sqlite3",
	connection:{
		filename: "./dbmovie.db"
	},
	useNullAsDefault: true
});


const { app, BrowserWindow, Menu, ipcMain, globalShortcut, webContents} = require('electron');


let mainWindow;
let addWindow;
let editWindow;
let deleteWindow;
let userWindow;


const settings = new Settings({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 }
  }
});


function createWindow() {
  let {width, height} = settings.get('windowBounds');
  mainWindow = new BrowserWindow( {
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  })


  mainWindow.loadFile('mainwindow.html')
  
  mainWindow.webContents.on('did-finish-load', ()=> {
    let theme = settings.get('theme');
    mainWindow.webContents.insertCSS(theme)
    mainWindow.webContents.send("showUsername", settings.get("user"));
  })

  
 
  mainWindow.on('closed', function() {
    app.quit();
  });

  mainWindow.on('resize', () => { 
    let { width, height } = mainWindow.getBounds();
    settings.set('windowBounds', { width, height });
    });

    


  let menu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(menu)



}



function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: 'Add Item',
    autoHideMenuBar:true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  });

  addWindow.loadFile('addwindow.html');
  addWindow.on('close', function() {
    addWindow = null;
  });

}


function createUserWindow(){
  userWindow = new BrowserWindow({
    width: 350,
    height: 250,
    title: 'Remove Item',
    autoHideMenuBar:true,
    webPreferences: {
      nodeIntegration: true,
	  contextIsolation: false  
    },
  })
  userWindow.loadFile('userwindow.html')
  userWindow.on('close', function() {
    userWindow = null;
  });

}


function createEditWindow(){
  editWindow = new BrowserWindow({
    width: 500,
    height: 640,
    title: 'Edit Item',
    autoHideMenuBar:true,
    webPreferences: {
      nodeIntegration: true,
	  contextIsolation: false  
    },
  })
  editWindow.loadFile('editwindow.html')
  editWindow.on('close', function() {
    editWindow = null;
  });

}

function clearWindow()
{
    mainWindow.webContents.send('item:clear');
}


ipcMain.on('item:add', function(e,title,genre,rating,review,imageLink) {
  knex("movietable").insert({title: title, genre: genre, rating: rating, review: review, 
  imageLink: imageLink}).then(() => console.log(title +": data inserted"))
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
    readDB();
  })
  addWindow.close();
});


ipcMain.on('setUser', function (e, user) {
  settings.set('user', user)
  console.log(user)
  mainWindow.webContents.send("showUsername", user);
  userWindow.close();
})



ipcMain.on('item:delete', function(e, mID){
  console.log(mID + ": got here index.js delete function");
  knex('movietable').where({"movieID" : mID}).del()
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
    console.log(mID +": deleted");
	readDB();
  })
});

ipcMain.on('item:search', function(e,movieID)
{
  console.log(movieID)
  createEditWindow()
  let result = knex.select("movieID","title","genre","rating","review","imageLink").from("movietable").where('movieID',movieID)
  .catch(err =>{
    console.log(err)
  })
  result.then(function(rows){  
    editWindow.webContents.on("did-finish-load", function(){
      console.log(rows)
      editWindow.webContents.send('item:found',rows);
    });
    
  })
})


ipcMain.on('item:edit', function(e,itemInfo)
{  
  let id = itemInfo[0] //undefined
  knex("movietable").where({"movieID": id}).update({
	  title: itemInfo[1],
	  genre: itemInfo[2],
	  rating: itemInfo[3],
    review: itemInfo[4],
    imageLink: itemInfo[5],
	  })

  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
	readDB();
  })
	  editWindow.close();
	  console.log(id +": Updated"); 
	  });


function readDB()
{
  clearWindow();
  let result = knex.select("movieID","title","genre","rating","review","imageLink").from("movietable")
  result.then(function(rows){
  mainWindow.webContents.send('item:add',rows);
  })

}

function darkMode(){
  let css ="body{background-color:rgb(48, 48, 48) !important;} h1{background-color:rgb(73, 73, 73) !important;font-family:sans-serif !important;color:white !important;}"
  css+="p{font-family:sans-serif !important; color:white !important;}th{background-color:rgb(73, 73, 73) !important;} table{color:white !important;}tr{background-color:rgb(68, 68, 68) !important;}"
  settings.set('theme', css)
  mainWindow.webContents.insertCSS(css)

}

function lightMode(){
  let css ="body{background-color:rgb(255, 255, 255) !important;} h1{background-color:rgb(142, 188, 206) !important;font-family:sans-serif !important;color:white !important;}"
  css+="p{font-family:sans-serif !important; color:black !important;}th{background-color:rgb(199, 198, 198) !important;} table{color:black !important;}tr{background-color:white !important;}"
  settings.set('theme', css)
  mainWindow.webContents.insertCSS(css);
 
}


const mainMenuTemplate = [
      {
        label: 'Settings',
        submenu: [
           {
          label: 'Themes',
          submenu: [
            {
              label: 'Dark Mode',
              click() {darkMode()}
            },
            {
              label: 'Light Mode',
              click() {lightMode()}
            },
          ]
        },
        {
          label: 'Set Username',
          click() {createUserWindow()}
        }
        ]
      },
      {
        label: 'Add Movie',
        click() {createAddWindow()}
      },
      {
        label: 'View Movies',
        click(){readDB()}
      },
	  {
        label: 'Clear',
        click(){clearWindow()}
      },
	  {
        label: 'Quit',
        accelerator:'CmdOrCtrl + q',
        click(){app.quit()}
      }
];

app.on('ready', createWindow)
