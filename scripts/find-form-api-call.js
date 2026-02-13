// Find Form API Call - Run this in console BEFORE the page loads
// Or check Network tab manually

console.log('=== FORM API FINDER ===\n');

// Intercept fetch requests
var originalFetch = window.fetch;
window.fetch = function() {
    var url = arguments[0];
    if (typeof url === 'string') {
        if (url.includes('api') || url.includes('form') || url.includes('template') || url.includes('fillout')) {
            console.log('🔍 FETCH REQUEST:', url);
            console.log('   Method:', arguments[1]?.method || 'GET');
            if (arguments[1]?.body) {
                console.log('   Body:', arguments[1].body);
            }
        }
    }
    return originalFetch.apply(this, arguments).then(function(response) {
        var url = arguments[0];
        if (typeof url === 'string' && (url.includes('api') || url.includes('form') || url.includes('template'))) {
            response.clone().json().then(function(data) {
                console.log('📦 RESPONSE DATA:', data);
                if (data.fields || data.pages || data.sections || data.questions) {
                    console.log('✅ FOUND FORM STRUCTURE!');
                    window.__FORM_API_RESPONSE__ = data;
                }
            }).catch(function() {});
        }
        return response;
    });
};

// Intercept XMLHttpRequest
var originalXHROpen = XMLHttpRequest.prototype.open;
var originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    if (typeof url === 'string' && (url.includes('api') || url.includes('form') || url.includes('template'))) {
        console.log('🔍 XHR REQUEST:', method, url);
    }
    return originalXHROpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    if (xhr._url && (xhr._url.includes('api') || xhr._url.includes('form') || xhr._url.includes('template'))) {
        xhr.addEventListener('load', function() {
            try {
                var data = JSON.parse(xhr.responseText);
                console.log('📦 XHR RESPONSE:', data);
                if (data.fields || data.pages || data.sections || data.questions) {
                    console.log('✅ FOUND FORM STRUCTURE!');
                    window.__FORM_API_RESPONSE__ = data;
                }
            } catch (e) {}
        });
    }
    return originalXHRSend.apply(this, arguments);
};

console.log('✅ Interceptors installed. Reload the page and check console for API calls.');
console.log('   Or check Network tab manually for requests containing: api, form, template');
