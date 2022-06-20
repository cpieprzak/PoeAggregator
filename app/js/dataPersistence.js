function loadLocalData() {
	let storedFields = document.querySelectorAll('.local-data');	
	for(let key in storedFields) {
		let storedField = storedFields[key];
		let storedValue = window.localStorage.getItem(storedField.id);
		if(storedValue?.trim()?.length) {
			if(storedField.nodeName && storedField.nodeName === 'SELECT') {
				let selectedIndex = -1;
				for(let j = 0; j < storedField.options.length; j++) {
					if(storedField.options[j].value == storedValue) selectedIndex = j;
				}
				storedField.selectedIndex = selectedIndex;
			}
			else if(storedField.type && storedField.type.toLowerCase() === 'checkbox') {
				if(storedValue != null && storedValue.length > 0) storedField.checked = true;
			}
			else storedField.value = storedValue;
			storedField.lastSavedValue = storedValue;
		}
		if(storedField.onblur) storedField.onblur();
		if(storedField.onchange) storedField.onchange();
	} 
} 

function saveLocalData(id) {
	let target = id ? document.getElementById(id) : document;
	let fieldsToSave = target.querySelectorAll('.local-data');
	if(fieldsToSave.length < 1) {
		fieldsToSave = [];
		let element = document.getElementById(id);
		if(element) fieldsToSave.push(element);
	}
	for(let i = 0; i < fieldsToSave.length; i++) {
		let field = fieldsToSave[i];
		if(field?.type?.toLowerCase() === 'select') {
			window.localStorage.setItem(field.id, field.options[field.selectedIndex].value);
		}
		else if(field?.type?.toLowerCase() === 'checkbox') {
			if(!field.checked) window.localStorage.setItem(field.id, '');
			else window.localStorage.setItem(field.id, field.value);
		}
		else window.localStorage.setItem(field.id, field.value);
	}
}