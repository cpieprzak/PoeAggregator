var sounds = [];
function populateSounds()
{
	for(var i = 1; i < 14; i++)
	{
		sounds['' + i] = new Audio('./audio/' + i +'.wav');
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
			volume = volume / 100;	
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
	catch(e)
	{
		console.log(e);
	}
	
} 
