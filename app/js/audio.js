const soundNames = [
	'Confirm',
	'Wood',
	'Pulse',
	'Harp',
	'Dit-Dot',
	'Melody',
	'Dot-Dot',
	'Metal',
	'Plink',
	'Huge',
	'Dial',
	'Arcade',
	'Ring'
];
var sounds = [];
function populateSounds(){
	for(let i = 1; i < 14; i++) sounds['' + i] = new Audio('./audio/' + i +'.wav');
	let soundSelects = document.querySelectorAll('select.search-sounds');
	for(let i = 0; i < soundSelects.length; i++) {
		let soundSelect = soundSelects[i];
		soundSelect.innerHTML = '';
		let blankOption = document.createElement('option');
		soundSelect.appendChild(blankOption);

		for (let key in sounds) {
			let newOption = document.createElement('option');
			newOption.value = key;
			newOption.appendChild(document.createTextNode(soundNames[key - 1]));
			soundSelect.appendChild(newOption);
		}
		soundSelect.playSound = function() {
			let soundId = this.value;
			sounds[soundId].play();
		}
	}
}

function playSound(soundId, volume) {
	try {
		if(volume == null || volume == '') volume = 25;
		if(soundId != null && soundId.length > 0) {
			if (sounds[soundId] == null) {
				let audioPath = '/audio/' + soundId;
				try {
					var newSound = new Audio('.' + audioPath);
					if(isNaN(sound.duration)) sounds[soundId] = newSound;
				}
				catch(e) {
					console.log('Could not find: ' + audioPath);
					sounds[soundId] = 'error';
				}
			}
		}
		if(soundId == null || soundId.trim() == '' || sounds[soundId] == 'error') {
			soundId = document.getElementById('notification-sound').value;
		}
		if(soundId != null && soundId.length > 0) {
			volume = volume / 100;	
			sounds[soundId].volume = volume;
			sounds[soundId].play();
		}
	}
	catch(e) { console.log(e); }	
} 
