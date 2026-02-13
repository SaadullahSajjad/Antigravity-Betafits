// Browser Console Script - Extract Fillout Form Structure
// Copy and paste this entire script into the browser console on the Fillout form page

console.log('Extracting Fillout form structure...');

// Get template ID from URL
var templateId = 'unknown';
var pathParts = window.location.pathname.split('/t/');
if (pathParts.length > 1) {
    var idPart = pathParts[1].split('?')[0];
    if (idPart) templateId = idPart;
}

var formData = {
    templateId: templateId,
    title: document.title || 'Form',
    pages: [],
    extractedAt: new Date().toISOString()
};

// Helper function to search for form structure
function findFormStructure(obj, depth) {
    depth = depth || 0;
    if (depth > 5) return null;
    
    if (!obj || typeof obj !== 'object') return null;
    
    if (obj.fields || obj.pages || obj.sections || obj.questions) {
        return obj;
    }
    
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var result = findFormStructure(obj[key], depth + 1);
            if (result) return result;
        }
    }
    
    return null;
}

// Extract form structure from DOM
function extractFromDOM() {
    var form = document.querySelector('form') || document.querySelector('[data-form]');
    if (!form) {
        console.log('No form element found in DOM');
        return null;
    }
    
    var fields = [];
    var inputs = form.querySelectorAll('input, select, textarea');
    
    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        var field = {
            id: input.id || input.name || 'field_' + i,
            name: input.name || input.id || 'field_' + i,
            type: input.type || input.tagName.toLowerCase(),
            label: getLabel(input),
            required: input.required || input.hasAttribute('required'),
            placeholder: input.placeholder || ''
        };
        
        if (input.tagName === 'SELECT' && input.options) {
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
    
    return {
        fields: fields,
        extractedFrom: 'DOM'
    };
}

// Get label for an input
function getLabel(input) {
    if (input.id) {
        var label = document.querySelector('label[for="' + input.id + '"]');
        if (label) return label.textContent.trim();
    }
    
    var parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    
    var prev = input.previousElementSibling;
    while (prev) {
        if (prev.tagName === 'LABEL') {
            return prev.textContent.trim();
        }
        prev = prev.previousElementSibling;
    }
    
    return input.placeholder || input.name || 'Untitled Field';
}

// Try to find form structure in window object
var formStructure = null;
var possibleLocations = [
    window.__NEXT_DATA__,
    window.__REACT_QUERY_STATE__,
    window.formData,
    window.filloutForm,
    window.formStructure,
    window.__FORM_DATA__
];

for (var i = 0; i < possibleLocations.length; i++) {
    var location = possibleLocations[i];
    if (location && typeof location === 'object') {
        var found = findFormStructure(location);
        if (found) {
            formStructure = found;
            break;
        }
    }
}

// If not found, extract from DOM
if (!formStructure) {
    formStructure = extractFromDOM();
}

// Also try to find form data in React/Next.js data structures
if (!formStructure) {
    // Check for React component tree
    var reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
    if (reactRoot) {
        console.log('Found React root, trying to extract from component data...');
    }
}

// Output results
console.log('\n=== FORM STRUCTURE ===');
console.log(JSON.stringify(formStructure, null, 2));
console.log('\n=== COPY THE JSON ABOVE ===');
console.log('Use it to update: constants/quickStartFormComplete.ts');

// Also try to extract page structure
console.log('\n=== EXTRACTING PAGE STRUCTURE ===');
var pages = document.querySelectorAll('[data-page], .page, [class*="page"]');
console.log('Found ' + pages.length + ' potential pages');

// Extract sections
var sections = document.querySelectorAll('[data-section], .section, [class*="section"]');
console.log('Found ' + sections.length + ' potential sections');

// Return the structure for further inspection
window.__EXTRACTED_FORM_STRUCTURE__ = formStructure;
console.log('\n=== Structure saved to window.__EXTRACTED_FORM_STRUCTURE__ ===');
console.log('Type this in console to inspect: window.__EXTRACTED_FORM_STRUCTURE__');
