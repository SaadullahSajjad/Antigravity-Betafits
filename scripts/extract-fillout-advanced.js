// ADVANCED EXTRACTION - Tries multiple methods to get form structure
// Copy and paste this into browser console on Fillout form page

console.log('=== ADVANCED FORM EXTRACTION ===\n');

// Method 1: Check for form data in window/React
function findInWindow() {
    console.log('Method 1: Searching window object...');
    var found = [];
    
    // Common React/Next.js data locations
    var locations = [
        '__NEXT_DATA__',
        '__REACT_QUERY_STATE__',
        'formData',
        'filloutForm',
        'formStructure',
        '__FORM_DATA__',
        '__APOLLO_STATE__'
    ];
    
    for (var i = 0; i < locations.length; i++) {
        var key = locations[i];
        if (window[key]) {
            console.log('Found: window.' + key);
            found.push({ location: key, data: window[key] });
        }
    }
    
    return found;
}

// Method 2: Check Network requests
function checkNetworkRequests() {
    console.log('\nMethod 2: Check Network tab for API calls');
    console.log('1. Open DevTools → Network tab');
    console.log('2. Reload the page');
    console.log('3. Look for requests containing: /api/, /v1/, /forms/, /templates/');
    console.log('4. Check Response tab for JSON with form structure');
}

// Method 3: Extract from visible form elements with better label detection
function extractVisibleForm() {
    console.log('\nMethod 3: Extracting visible form structure...');
    
    var formData = {
        pages: [],
        sections: [],
        fields: []
    };
    
    // Find all visible text that might be labels
    var allText = document.body.innerText;
    
    // Look for section headings
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="heading"], [class*="title"]');
    console.log('Found ' + headings.length + ' headings');
    
    // Find form containers
    var formContainers = document.querySelectorAll('[class*="form"], [class*="page"], [class*="section"]');
    console.log('Found ' + formContainers.length + ' form containers');
    
    // Extract all input fields with better context
    var inputs = document.querySelectorAll('input, select, textarea');
    var fields = [];
    
    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        
        // Skip hidden inputs
        if (input.type === 'hidden' || input.style.display === 'none') continue;
        
        // Get parent container
        var container = input.closest('[class*="field"], [class*="input"], [class*="form-group"]');
        
        // Try multiple ways to find label
        var label = '';
        var labelElement = null;
        
        // Method 1: Associated label
        if (input.id) {
            labelElement = document.querySelector('label[for="' + input.id + '"]');
            if (labelElement) label = labelElement.textContent.trim();
        }
        
        // Method 2: Parent label
        if (!label) {
            labelElement = input.closest('label');
            if (labelElement) label = labelElement.textContent.trim();
        }
        
        // Method 3: Previous sibling
        if (!label) {
            var prev = input.previousElementSibling;
            while (prev && !label) {
                if (prev.tagName === 'LABEL' || prev.classList.contains('label')) {
                    label = prev.textContent.trim();
                    break;
                }
                if (prev.textContent && prev.textContent.trim().length < 100) {
                    label = prev.textContent.trim();
                }
                prev = prev.previousElementSibling;
            }
        }
        
        // Method 4: Look in container
        if (!label && container) {
            var containerText = container.textContent;
            var lines = containerText.split('\n');
            for (var j = 0; j < lines.length; j++) {
                var line = lines[j].trim();
                if (line && line.length < 100 && !line.includes('*') && !line.match(/^\d+$/)) {
                    label = line;
                    break;
                }
            }
        }
        
        // Method 5: Placeholder or name
        if (!label) {
            label = input.placeholder || input.name || 'Untitled Field';
        }
        
        var field = {
            id: input.id || input.name || 'field_' + i,
            name: input.name || input.id || 'field_' + i,
            type: input.type || input.tagName.toLowerCase(),
            label: label,
            required: input.required || input.hasAttribute('required'),
            placeholder: input.placeholder || '',
            visible: true
        };
        
        // Get options for select
        if (input.tagName === 'SELECT' && input.options) {
            field.options = [];
            for (var j = 0; j < input.options.length; j++) {
                if (input.options[j].value) {
                    field.options.push({
                        value: input.options[j].value,
                        label: input.options[j].text
                    });
                }
            }
        }
        
        // Get radio button groups
        if (input.type === 'radio' && input.name) {
            var radios = document.querySelectorAll('input[type="radio"][name="' + input.name + '"]');
            if (radios.length > 1) {
                field.radioGroup = [];
                for (var k = 0; k < radios.length; k++) {
                    var radioLabel = '';
                    var radioLabelEl = document.querySelector('label[for="' + radios[k].id + '"]');
                    if (radioLabelEl) {
                        radioLabel = radioLabelEl.textContent.trim();
                    } else {
                        var radioParent = radios[k].closest('label');
                        if (radioParent) radioLabel = radioParent.textContent.trim();
                    }
                    field.radioGroup.push({
                        id: radios[k].id,
                        value: radios[k].value,
                        label: radioLabel || radios[k].value
                    });
                }
            }
        }
        
        fields.push(field);
    }
    
    formData.fields = fields;
    return formData;
}

// Method 4: Try to find form schema in script tags
function findInScripts() {
    console.log('\nMethod 4: Searching script tags...');
    var scripts = document.querySelectorAll('script[type="application/json"], script:not([src])');
    var found = [];
    
    for (var i = 0; i < scripts.length; i++) {
        try {
            var content = scripts[i].textContent;
            if (content && (content.includes('form') || content.includes('field') || content.includes('page'))) {
                try {
                    var parsed = JSON.parse(content);
                    if (parsed.form || parsed.fields || parsed.pages) {
                        found.push(parsed);
                    }
                } catch (e) {
                    // Not JSON, but might contain form data
                }
            }
        } catch (e) {}
    }
    
    return found;
}

// Run all methods
var windowData = findInWindow();
var visibleForm = extractVisibleForm();
var scriptData = findInScripts();

checkNetworkRequests();

console.log('\n=== RESULTS ===');
console.log('\n1. Window Data Found:');
if (windowData.length > 0) {
    windowData.forEach(function(item, idx) {
        console.log('   ' + (idx + 1) + '. window.' + item.location);
        console.log('      Type: ' + typeof item.data);
        if (typeof item.data === 'object') {
            console.log('      Keys: ' + Object.keys(item.data).slice(0, 10).join(', '));
        }
    });
} else {
    console.log('   None found');
}

console.log('\n2. Visible Form Fields:');
console.log('   Total fields: ' + visibleForm.fields.length);
console.log('\n   Fields:');
visibleForm.fields.forEach(function(field, idx) {
    console.log('   ' + (idx + 1) + '. ' + field.label + ' (' + field.type + ') - ' + (field.required ? 'Required' : 'Optional'));
    if (field.options && field.options.length > 0) {
        console.log('      Options: ' + field.options.length);
    }
    if (field.radioGroup && field.radioGroup.length > 0) {
        console.log('      Radio options: ' + field.radioGroup.length);
    }
});

console.log('\n3. Script Tag Data:');
if (scriptData.length > 0) {
    console.log('   Found ' + scriptData.length + ' potential data sources');
    scriptData.forEach(function(data, idx) {
        console.log('   Script ' + (idx + 1) + ': ' + Object.keys(data).join(', '));
    });
} else {
    console.log('   None found');
}

// Output full JSON
console.log('\n=== FULL EXTRACTED DATA ===');
console.log(JSON.stringify({
    windowData: windowData,
    visibleForm: visibleForm,
    scriptData: scriptData
}, null, 2));

// Save to window
window.__FULL_FORM_EXTRACTION__ = {
    windowData: windowData,
    visibleForm: visibleForm,
    scriptData: scriptData
};

console.log('\n=== Data saved to window.__FULL_FORM_EXTRACTION__ ===');
console.log('Inspect with: window.__FULL_FORM_EXTRACTION__');
