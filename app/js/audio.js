const soundNames = [
	'Confirm',
	'Wood',
	'Pulse',
	'Melody',
	'Dit-Dot',
	'Melody 2',
	'Dot-Dot',
	'Metal',
	'Plink',
	'OMG',
	'Dial',
	'Arcade',
	'Ring'
];
var sounds = [];
function populateSounds()
{
	for(var i = 1; i < 14; i++)
	{
		sounds[soundNames[i - 1]] = new Audio('./audio/' + i +'.wav');
	}
	var soundSelects = document.querySelectorAll('select.search-sounds');
	for(var i = 0; i < soundSelects.length; i++)
	{
		var soundSelect = soundSelects[i];
		soundSelect.innerHTML = '';
		var blankOption = document.createElement('option');
		soundSelect.appendChild(blankOption);
		
		for (var key in sounds)
		{
			var newOption = document.createElement('option');
			newOption.value = key;
			newOption.appendChild(document.createTextNode(key));
			soundSelect.appendChild(newOption);
		}
		soundSelect.playSound = function()
		{
			var soundId = this.value;
			sounds[soundId].play();
		}
	}
}
populateSounds();

function playSound(soundId, volume)
{
	try
	{
		if(volume == null || volume == '')
		{
			volume = 25;
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
			volume = volume / 100;	
			sounds[soundId].volume = volume;
			sounds[soundId].play();
		}
	}
	catch(e)
	{
		console.log(e);
	}
	
} 
