// background.js

// Firefox uses 'browser' namespace, Chrome uses 'chrome'.
// We can use the 'browser' namespace for compatibility in Firefox.
browser.browserAction.onClicked.addListener(async function(tab) {
  // Get the current URL
  let url = tab.url;

  // Check if debug=1 is present
  const debugParamRegex = /(\?|&)debug=1/;
  if (debugParamRegex.test(url)) {
    // Developer mode is currently active, so remove it
    url = removeDebugParam(url);
  } else {
    // Developer mode not active, so add it
    url = addDebugParam(url);
  }

  // Update the tab with the new URL
  browser.tabs.update(tab.id, { url: url });
});

function removeDebugParam(url) {
  // This will remove ?debug=1 or &debug=1 from the URL
  // We'll remove the 'debug=1' parameter cleanly.
  url = url.replace(/(\?|&)debug=1/, '');
  
  // Cleanup any trailing ? or & if needed.
  // If debug=1 was the only query parameter and it started with '?', 
  // we might now have a leftover '?' or '&' before a '#'.
  url = url.replace(/\?($|#)/, '$1'); // Remove '?' if no more query params
  url = url.replace(/&($|#)/, '$1'); // Remove '&' if end of string or before '#'
  
  return url;
}

function addDebugParam(url) {
  // Two main cases:
  // 1. Odoo < 18:
  //    Insert `?debug=1` right after `/web` before the hash if it exists.
  //    Example: /web#menu_id=... -> /web?debug=1#menu_id=...
  //
  // 2. Odoo 18:
  //    If the above doesn't activate developer mode, appending `?debug=1` at the end also works.
  //
  // For simplicity, let's first try the insertion after `/web` if there's a hash.

  if (url.includes('/web#')) {
    // Insert `?debug=1` before the `#`
    url = url.replace('/web#', '/web?debug=1#');
  } else {
    // If there's no hash right after `/web`, just append ?debug=1 at the end.
    // Check if URL already has a '?'
    if (url.includes('?')) {
      // Append with '&'
      url = url + '&debug=1';
    } else {
      // Append with '?'
      url = url + '?debug=1';
    }
  }

  return url;
}
