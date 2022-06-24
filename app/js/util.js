const utilIpc = require('electron').ipcRenderer;
const {clipboard} = require('electron');

utilIpc.on('log', (event,msg) => { console.log(msg); });

utilIpc.on('run-command', (event,command,arg1,arg2,arg3) => { 
	switch(command) {
		case 'log()' : console.log(arg1);
			break;
		case 'send-clipboard-to-poe' : outputClipboardTextToPoe();
			break;
		case 'displayTradeUrlPart()' : displayTradeUrlPart(arg1);
			break;
		case 'configView()' : configView();
			break;
		case 'highlightView()' : highlightView();
			break;			
	}
});

function copyTextToClipboard(text) { clipboard.writeText(text); }

var selectedLeague = null;
function updateSelectedLeague() {
	saveLocalData('league-wrapper');
	selectedLeague = QS('#league').value;
	let javascript = `setSelectedLeague('${selectedLeague}')`;
	callAllWindowFunction(javascript);
}

function setSelectedLeague(league) { selectedLeague = league; }

function showHide(elementId,button) {
	var element = document.getElementById(elementId);
	if(element) {
		var classList = element.classList;
		var hidden = 'hidden';
		if(classList.contains(hidden)) {
			if(button) button.innerHTML = button.innerHTML.replace('Show','Hide');
			classList.remove(hidden);
		}
		else {
			if(button) button.innerHTML = button.innerHTML.replace('Hide','Show');
			classList.add(hidden);
		}
	}	
}

function showHideClass(cssClass,button) {
	let elements = QSA(`.${cssClass}`);	
	for(const element of elements) {
		let hidden = 'hidden';
		if(element.classList.contains(hidden)) {
			if(button) button.innerHTML = button.innerHTML.replace('Show','Hide');
			element.classList.remove(hidden);
		}
		else {
			if(button) button.innerHTML = button.innerHTML.replace('Hide','Show');
			element.classList.add(hidden);
		}	
	}
}

function hide(elementId,button) {
	var element = document.getElementById(elementId);
	if(element) {
		if(button) button.innerHTML = button.innerHTML.replace('Hide','Show');
		element.classList.add('hidden');
	}	
}

function callMainWindowFunction(javascript) { utilIpc.send('main-window-function',javascript); }

function callAllWindowFunction(javascript) { utilIpc.send('all-window-function',javascript); }

function goToHideout() {
	copyTextToClipboard('/hideout');
	sendClipboardTextToPoe();
}

function sendClipboardTextToPoe() { utilIpc.send('run-main-command','send-clipboard-to-poe'); }

function newPoeSearch(slug) {
	slug = slug == null ? '' : `${selectedLeague}/${slug}`;
	utilIpc.send('show-main-window');
	callMainWindowFunction(`loadOfficialTradeWebsite(\'https://www.pathofexile.com/trade/search/${slug}\');`);
}

const log = (msg) => console.log(msg);
const QS = (selector,element) => {return element ? element.querySelector(selector) : document.querySelector(selector)};
const QSA = (selector,element) => {return element ? element.querySelectorAll(selector) : document.querySelectorAll(selector)};


const checkDelay = 10;
var watchingClipboard = false;
const getClipboardData = (timeout = 1000) => new Promise((resolve, reject) => {
	if(!watchingClipboard)
	{
		watchingClipboard = true;
		let checks = 1;
		const maxChecks = timeout / checkDelay;
		const interval = setInterval(() => {
			const text = clipboard.readText();
			if (text) {
				watchingClipboard = false;
				clearInterval(interval);
				resolve(text);
			} 
			if (checks >= maxChecks) {
				watchingClipboard = false;
				clearInterval(interval);
				reject(new Error('Timed out'));
			}
			checks++;
		}, checkDelay);
	}
	else reject(new Error('Already waiting!'));
});

function simplifyMod(text) {
    text = text.toLowerCase().trim();
    text = text.replace(/[^a-zA-Z]/gi, '_');
    text = text.replace(/_+/g,'-');
    while(text.startsWith('-')){text = text.substring(1);}
    while(text.endsWith('-')){text = text.substring(0,text.length-1);}

    return text;
}

const modMap = new Map();
for (const term of ['unique', 'implicit', 'prefix', 'suffix']) {
    modMap.set(`${term[0].toUpperCase()}${term.slice(1)} Modifier`,term);
}

const upperCaseFirstLetter = (string) => {
	return string ? string[0].toUpperCase() + string.slice(1) : string;
}

const lookupModType = (modName) => {
    let modType = null;
    for(const key of [ ...modMap.keys() ]) {
        if(modName.includes(key)) {
            modType = modMap.get(key);
            break;
        }
    }
    return modType;    
}

const numbersFromString = (text) => text.match(/[+-]?[0-9\.]./gi);

function findValueFromPath(object, objectPath) {
	var objectValue = object;
	var objectParts = objectPath.split('.');
	if(objectParts != null && objectParts.length > 0) {
		for(var i = 0; i < objectParts.length; i++) {
			var varName = objectParts[i];
			if(objectValue != null) {
				objectValue = objectValue[varName];
				if(typeof objectValue === 'undefined') {
					objectValue = '';
					break;
				}
			}
			else {
				objectValue = '';
				break;
			}
		}
	}
	return objectValue;
}

function setValueOnObject(object, value, path) {
    let i = 0;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++) {
		let pathPart = path[i];
		let tmp = object[pathPart];
		if(tmp == null) object[pathPart] = new Object();
		object = object[path[i]];		
	}

    object[path[i]] = value;
}

function updateTimes() {
	var timesToUpdate = document.querySelectorAll('.create-date');
	for (var i = 0; i < timesToUpdate.length; i++) {
		var time = timesToUpdate[i];
		var createDate = time.createDate;
		var now = new Date();
		var text = 'A few seconds';
		var ageInSeconds = (now - createDate) / 1000;
		if(ageInSeconds < 60) text = Math.round(ageInSeconds) + ' seconds ago';
		else {
			var timeInMinutes = ageInSeconds / 60;
			var minutesString = 'minutes';
			if(timeInMinutes < 2) minutesString = 'minute';
			text = Math.round(timeInMinutes) + ' ' + minutesString + ' ago';
		
		}
		time.innerHTML = text;
	}
}

function timeFromNow(date) {	
	let msg = 'A few seconds ago';
	let ms = (new Date()).getTime() - date.getTime();
	let seconds = ms / 1000;
	if(seconds < 60) msg = 'a few seconds ago';
	else {
		let minutes = (seconds / 60).toFixed(0);
		if(minutes < 60) msg = minutes == 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
		else {
			let hours = (minutes / 60).toFixed(1);
			if(hours < 24) msg = hours == 1 ? `${hours} hour ago` : `${hours} hours ago`;
			else {
				let days = (hours / 60).toFixed(1);
				if(days < 24) msg = days == 1 ? `${days} day ago` : `${days} days ago`;
				else {
					let months = (days / 30.0).toFixed(1);
					msg = months == 1 ? `${months} month ago` : `${months} months ago`;
				} 
			}
		}
	}
	return msg;
}

const roundToPlaces = (num, places) => {
	let rounded = num;
	if(places == 0) rounded = parseInt(num.toFixed(0),10);
	else rounded = Math.round((num + Number.EPSILON) * (1 * 10 ^ places)) / (1 * 10 ^ places);
	return rounded;
};

function configureFilter (filterInput, getFilterElementAndText) {
	filterInput.onkeyup = (event) => {
		if(event.key === "Escape") filterInput.value = '';
		filterForText(filterInput.value,getFilterElementAndText);
	};
	filterInput.onblur = (event) => { filterForText(filterInput.value,getFilterElementAndText); };
	filterInput.onclick = () => { filterInput.value = ''; };
}

function filterForText(filterText, getFilterElementAndText) {
	for(let target of getFilterElementAndText()) {
		if(shouldShowFilteredObject(filterText, target.text)) target.element.classList.remove('hidden');
		else target.element.classList.add('hidden');
	}
};

function shouldShowFilteredObject(filterText, targetText) {
	if(!(filterText?.trim())) return true;
	if(!(targetText?.trim())) return true;
	filterText = filterText.toLowerCase().trim();
	targetText = targetText.toLowerCase().trim();
    if(!filterText.startsWith('~')) return targetText.indexOf(filterText) > -1;
    else {
        filterText = filterText.substring(1);
        let textParts = filterText.split(' ');
        let show = true;
        for(let i = 0; i < textParts.length; i++) {
            let textPart = textParts[i];
            let isNot = textPart.startsWith('!');
            if(isNot) {
                textPart = textPart.substring(1);
                if(textPart.length > 0 && targetText.indexOf(textPart) >= 0) { show = false; break; }
            }
            else if(targetText.indexOf(textPart) < 0) { show = false; break; }		
        }
        return show;
    }
}