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

var sounds = [];
populateSounds();
function populateSounds(){
	sounds['woop'] = new Audio('http://poe.trade//static/notification.mp3');
	sounds['woop'].volume = 0.5;
	sounds['gong'] = new Audio('https://web.poecdn.com/audio/trade/gong.mp3');
	sounds['gong'].volume = 0.5;
}

function playSound(soundId, volume)
{
	if(volume == null || volume == '')
	{
		volume = 0.5;
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
	console.log(soundId);
	if(soundId == null || soundId.trim() == '' || sounds[soundId] == 'error')
	{
		soundId = document.getElementById('notification-sound').value;
	}
	if(soundId != null && soundId.length > 0)
	{
		sounds[soundId].play();
	}
} 
