function loadLocalData() 
{ 
	var storedFields = document.querySelectorAll('.local-data');
	
	for(var key in storedFields)
	{
		var storedField = storedFields[key];
		var storedValue = window.localStorage.getItem(storedField.id); 
		if(storedValue != null && storedValue.trim().length > 0)
		{
			if(storedField.nodeName && storedField.nodeName === 'SELECT')
			{
				var selectedIndex = -1;
				for(var j = 0; j < storedField.options.length; j++)
				{
					if(storedField.options[j].value == storedValue)
					{
						selectedIndex = j;
					}
				}
				storedField.selectedIndex = selectedIndex;
			}
			else if(storedField.type && storedField.type.toLowerCase() === 'checkbox')
			{
				if(storedValue != null && storedValue.length > 0)
				{
					storedField.checked = true;
				}
			}
			else
			{
				storedField.value = storedValue; 
			}
			storedField.lastSavedValue = storedValue;
		}
	} 
} 
loadLocalData();

function saveLocalData()
{
	var fieldsToSave = document.querySelectorAll('.local-data');
	for(var i = 0; i < fieldsToSave.length; i++)
	{
		var field = fieldsToSave[i];
		window.localStorage.setItem(field.id, field.value);
		if(field.type && field.type.toLowerCase() === 'checkbox')
		{
			if(!field.checked)
			{
				window.localStorage.setItem(field.id, '');
			}
		}
	}
}