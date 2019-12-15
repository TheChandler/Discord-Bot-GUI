const {app, BrowserWindow, Menu, MenuItem,ipcMain} = require('electron');


var onlyWin;

function createWindow() {
	win = new BrowserWindow({
		width: 1000,
		height: 750,
		webPreferences: { nodeIntegration: true },
	});

	console.log("hey");
	win.loadURL('http://localhost:3000');
	win.setMenu(makeMenu());
	onlyWin=win;
}

function sendMessage(){
	console.log("Send Message");
	onlyWin.webContents.send('messages', {msg:"Do it"});
}

function makeMenu(){
	var menu= new Menu();
	menu.append(new MenuItem({ label:'Button',click(){sendMessage()} } ));
	return menu;
}


app.on('ready', createWindow);