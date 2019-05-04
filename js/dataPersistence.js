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
			else
			{
				storedField.value = storedValue; 
			}
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
	}
}