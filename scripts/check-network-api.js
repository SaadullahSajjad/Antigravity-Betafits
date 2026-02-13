// Network API Inspector
// Run this AFTER opening the form and checking Network tab
// This helps identify which API calls contain form structure

console.log('=== NETWORK API INSPECTOR ===\n');
console.log('Instructions:');
console.log('1. Open DevTools → Network tab');
console.log('2. Reload the Fillout form page');
console.log('3. Filter by: XHR or Fetch');
console.log('4. Look for requests to:');
console.log('   - /api/');
console.log('   - /v1/');
console.log('   - /forms/');
console.log('   - /templates/');
console.log('   - fillout.com/api');
console.log('5. Click on each request and check the Response tab');
console.log('6. Look for JSON containing: fields, pages, sections, questions\n');

// Try to intercept fetch requests (if page hasn't loaded yet)
if (window.fetch) {
    var originalFetch = window.fetch;
    window.fetch = function() {
        var url = arguments[0];
        if (typeof url === 'string' && (url.includes('api') || url.includes('form') || url.includes('template'))) {
            console.log('Fetch request detected:', url);
        }
        return originalFetch.apply(this, arguments);
    };
}

// Check if there's any form data in localStorage/sessionStorage
console.log('\n=== Checking Storage ===');
var storageKeys = [];
for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.includes('form') || key.includes('fillout')) {
        storageKeys.push(key);
        console.log('localStorage:', key);
    }
}
for (var i = 0; i < sessionStorage.length; i++) {
    var key = sessionStorage.key(i);
    if (key.includes('form') || key.includes('fillout')) {
        storageKeys.push(key);
        console.log('sessionStorage:', key);
    }
}

// Try to find React component tree
console.log('\n=== Checking React DevTools ===');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected!');
    console.log('Use React DevTools extension to inspect component props');
}

// Check for common form libraries
console.log('\n=== Checking for Form Libraries ===');
var libraries = {
    'React Hook Form': window.ReactHookForm || document.querySelector('[data-react-hook-form]'),
    'Formik': window.Formik,
    'React Final Form': window.ReactFinalForm,
    'Fillout SDK': window.Fillout || window.fillout
};

for (var lib in libraries) {
    if (libraries[lib]) {
        console.log('Found:', lib);
    }
}

console.log('\n=== Manual Inspection Tips ===');
console.log('1. Right-click on a form field → Inspect Element');
console.log('2. Look for data attributes: data-field-id, data-field-name, data-required');
console.log('3. Check parent elements for field labels');
console.log('4. Look for React component props in DevTools');
console.log('5. Check the Elements tab for form structure');
