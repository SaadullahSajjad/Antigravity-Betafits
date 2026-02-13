// CAPTURE FILLOUT API RESPONSE
// Run this BEFORE the page loads, then reload the page
// This will intercept the API call that loads the form structure

console.log('🔍 Fillout API Interceptor installed. Reload the page now...\n');

// Intercept fetch
var originalFetch = window.fetch;
window.fetch = function() {
    var url = arguments[0];
    var options = arguments[1] || {};
    
    if (typeof url === 'string') {
        // Look for the form API endpoint
        if (url.includes('/public/flows/') || 
            url.includes('/admin/flows/') ||
            url.includes('/v1/flow/') ||
            (url.includes('fillout.com') && (url.includes('flow') || url.includes('form')))) {
            
            console.log('🎯 INTERCEPTED API CALL:');
            console.log('   URL:', url);
            console.log('   Method:', options.method || 'GET');
            
            // Make the request
            return originalFetch.apply(this, arguments).then(function(response) {
                // Clone response to read it without consuming it
                response.clone().json().then(function(data) {
                    console.log('\n✅ FORM STRUCTURE FOUND!');
                    console.log('   Full response:', data);
                    
                    // Extract form structure
                    if (data.flowSnapshot && data.flowSnapshot.template) {
                        var template = data.flowSnapshot.template;
                        console.log('\n📋 FORM TEMPLATE:');
                        console.log('   ID:', template.id || 'N/A');
                        console.log('   Steps:', Object.keys(template.steps || {}).length);
                        console.log('   First Step:', template.firstStep);
                        
                        // Save to window for inspection
                        window.__FILLOUT_FORM_DATA__ = data;
                        window.__FILLOUT_TEMPLATE__ = template;
                        
                        console.log('\n💾 Saved to:');
                        console.log('   window.__FILLOUT_FORM_DATA__ (full response)');
                        console.log('   window.__FILLOUT_TEMPLATE__ (template only)');
                        console.log('\n📝 Copy this to update form definition:');
                        console.log(JSON.stringify(template, null, 2));
                    } else {
                        console.log('   Response structure:', Object.keys(data));
                        window.__FILLOUT_API_RESPONSE__ = data;
                    }
                }).catch(function(err) {
                    console.log('   Response is not JSON or error:', err);
                });
                
                return response;
            }).catch(function(err) {
                console.log('   Request failed:', err);
                return originalFetch.apply(this, arguments);
            });
        }
    }
    
    return originalFetch.apply(this, arguments);
};

// Also intercept XMLHttpRequest
var originalXHROpen = XMLHttpRequest.prototype.open;
var originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalXHROpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    var url = xhr._url;
    
    if (url && (url.includes('/public/flows/') || 
                url.includes('/admin/flows/') ||
                url.includes('/v1/flow/') ||
                (url.includes('fillout.com') && (url.includes('flow') || url.includes('form'))))) {
        
        console.log('🎯 INTERCEPTED XHR:', xhr._method, url);
        
        xhr.addEventListener('load', function() {
            try {
                var data = JSON.parse(xhr.responseText);
                console.log('\n✅ FORM STRUCTURE FOUND (XHR)!');
                console.log('   Full response:', data);
                
                if (data.flowSnapshot && data.flowSnapshot.template) {
                    window.__FILLOUT_FORM_DATA__ = data;
                    window.__FILLOUT_TEMPLATE__ = data.flowSnapshot.template;
                    console.log('\n💾 Saved to window.__FILLOUT_TEMPLATE__');
                    console.log(JSON.stringify(data.flowSnapshot.template, null, 2));
                } else {
                    window.__FILLOUT_API_RESPONSE__ = data;
                }
            } catch (e) {
                console.log('   Response is not JSON');
            }
        });
    }
    
    return originalXHRSend.apply(this, arguments);
};

console.log('✅ Ready! Now reload the page and watch the console.');
