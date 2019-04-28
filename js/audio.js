var sounds = [];
function populateSounds(){
	sounds['woop'] = new Audio('http://poe.trade//static/notification.mp3');
	sounds['gong'] = new Audio('https://web.poecdn.com/audio/trade/gong.mp3');
	for(var i = 1; i < 10; i++)
	{
		sounds['' + i] = new Audio('./audio/' + i +'.wav');
	}
	var soundSelect = document.getElementById('notification-sound');
	soundSelect.innerHTML = '';
	var blankOption = document.createElement('option');
	soundSelect.append(blankOption);
	for (var key in sounds)
	{
		var newOption = document.createElement('option');
		newOption.value = key;
		newOption.append(document.createTextNode(key));
		soundSelect.append(newOption);
	}
	soundSelect.playSound = function()
	{
		var soundId = this.value;
		sounds[soundId].play();
	}
}
populateSounds();

function initialiseLocalData() 
{ 
	var storedFields = ['searches','league','notification-sound'];
	
	for(var key in storedFields)
	{
		var storedField = storedFields[key];
		var storedValue = window.localStorage.getItem(storedField); 
		if(storedValue != null && storedValue.trim().length > 0)
		{
			document.getElementById(storedField).value = storedValue; 
		}
	} 
} 
initialiseLocalData();


function playSound(soundId, volume)
{
	if(volume == null || volume == '')
	{
		volume = 0.25;
	}
	if(soundId != null && soundId.length > 0)
	{
		if (sounds[soundId] == null)
		{
			var audioPath = '/audio/' + soundId;
			try
			{
				var newSound = new Audio('.' + audioPath);
				if(isNaN(sound.duration))
				{
					sounds[soundId] = newSound;			
				}
			}
			catch(e)
			{
				console.log('Could not find: ' + audioPath);
				sounds[soundId] = 'error';
			}
		}
	}
	if(soundId == null || soundId.trim() == '' || sounds[soundId] == 'error')
	{
		soundId = document.getElementById('notification-sound').value;
	}
	if(soundId != null && soundId.length > 0)
	{
		sounds[soundId].volume = volume;
		sounds[soundId].play();
	}
} 
