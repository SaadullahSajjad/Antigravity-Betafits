// SIMPLE VERSION - Just extract all form fields from DOM
// Copy and paste this into browser console

var fields = [];
var inputs = document.querySelectorAll('input, select, textarea');

for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var label = '';
    
    // Find label
    if (input.id) {
        var labelEl = document.querySelector('label[for="' + input.id + '"]');
        if (labelEl) label = labelEl.textContent.trim();
    }
    
    if (!label) {
        var parent = input.closest('label');
        if (parent) label = parent.textContent.trim();
    }
    
    var field = {
        id: input.id || input.name || 'field_' + i,
        name: input.name || input.id || 'field_' + i,
        type: input.type || input.tagName.toLowerCase(),
        label: label || input.placeholder || 'Untitled',
        required: input.required || false,
        placeholder: input.placeholder || ''
    };
    
    // Get options for select
    if (input.tagName === 'SELECT') {
        field.options = [];
        for (var j = 0; j < input.options.length; j++) {
            field.options.push({
                value: input.options[j].value,
                label: input.options[j].text
            });
        }
    }
    
    fields.push(field);
}

console.log('=== EXTRACTED FIELDS ===');
console.log(JSON.stringify(fields, null, 2));
console.log('\nTotal fields: ' + fields.length);

// Save to window for inspection
window.__EXTRACTED_FIELDS__ = fields;
