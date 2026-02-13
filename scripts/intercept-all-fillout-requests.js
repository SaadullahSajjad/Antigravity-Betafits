// INTERCEPT ALL FILLOUT REQUESTS
// Run this in console BEFORE the page loads, then reload
// This will capture ALL network requests to find the real API endpoint

console.log('🔍 Intercepting all Fillout requests...\n');
console.log('⚠️  Reload the page now to capture requests\n');

var capturedRequests = [];

// Intercept fetch
var originalFetch = window.fetch;
window.fetch = function() {
    var url = arguments[0];
    var options = arguments[1] || {};
    
    if (typeof url === 'string') {
        // Capture ALL requests (we'll filter later)
        var requestInfo = {
            url: url,
            method: options.method || 'GET',
            timestamp: new Date().toISOString()
        };
        
        capturedRequests.push(requestInfo);
        console.log('📡 FETCH:', requestInfo.method, url);
        
        // Make the request
        return originalFetch.apply(this, arguments).then(function(response) {
            // Log response status
            if (!response.ok && response.status !== 200) {
                console.log('   ❌ Status:', response.status, response.statusText);
            } else {
                console.log('   ✅ Status:', response.status);
            }
            
            // Try to read JSON response
            response.clone().json().then(function(data) {
                // Check if this looks like form data
                if (data.flowSnapshot || data.flow || data.template || data.steps || data.fields) {
                    console.log('\n🎯 FOUND FORM DATA!');
                    console.log('   URL:', url);
                    console.log('   Data:', data);
                    window.__FOUND_FORM_ENDPOINT__ = url;
                    window.__FOUND_FORM_DATA__ = data;
                    
                    if (data.flowSnapshot && data.flowSnapshot.template) {
                        window.__FORM_TEMPLATE__ = data.flowSnapshot.template;
                        console.log('\n💾 Template saved to window.__FORM_TEMPLATE__');
                    }
                } else if (Object.keys(data).length > 0) {
                    // Log other JSON responses for inspection
                    console.log('   📦 Response keys:', Object.keys(data));
                }
            }).catch(function(err) {
                // Not JSON or error reading
            });
            
            return response;
        }).catch(function(err) {
            console.log('   ❌ Error:', err.message);
            return originalFetch.apply(this, arguments);
        });
    }
    
    return originalFetch.apply(this, arguments);
};

// Intercept XMLHttpRequest
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
    
    if (url) {
        var requestInfo = {
            url: url,
            method: xhr._method || 'GET',
            timestamp: new Date().toISOString()
        };
        
        capturedRequests.push(requestInfo);
        console.log('📡 XHR:', xhr._method, url);
        
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('   ✅ Status:', xhr.status);
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.flowSnapshot || data.flow || data.template || data.steps || data.fields) {
                        console.log('\n🎯 FOUND FORM DATA (XHR)!');
                        console.log('   URL:', url);
                        console.log('   Data:', data);
                        window.__FOUND_FORM_ENDPOINT__ = url;
                        window.__FOUND_FORM_DATA__ = data;
                        
                        if (data.flowSnapshot && data.flowSnapshot.template) {
                            window.__FORM_TEMPLATE__ = data.flowSnapshot.template;
                            console.log('\n💾 Template saved to window.__FORM_TEMPLATE__');
                        }
                    }
                } catch (e) {
                    // Not JSON
                }
            } else {
                console.log('   ❌ Status:', xhr.status, xhr.statusText);
            }
        });
    }
    
    return originalXHRSend.apply(this, arguments);
};

// Helper to view all captured requests
window.__VIEW_REQUESTS__ = function() {
    console.log('\n📋 All Captured Requests:');
    console.table(capturedRequests);
    return capturedRequests;
};

console.log('✅ Interceptor ready!');
console.log('   After page loads, type: window.__VIEW_REQUESTS__()');
console.log('   To see all captured requests\n');
