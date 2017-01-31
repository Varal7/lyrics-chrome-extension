/**
 * Author: Varal7
 * Date: Jan 2017
 **/

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabTitle(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var title = tab.title;

    console.assert(typeof title == 'string', 'tab.url should be a string');
    callback(title);
  });
}

/**
 * @param {string} searchTerm - Search term for Lyrics.ovh
 * @param {function(string,number,number)} callback - Called when lyrics have
 *   been found.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getLyrics(artist, songTitle, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://api.lyrics.ovh/v1/' + artist + '/' + songTitle;
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.lyrics ||
        response.lyrics.length === 0) {
      errorCallback('No response from lyrics.ovh API!');
      return;
    }
    callback(response.lyrics);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function parseTitle(searchTerm, callback, errorCallback) {
    console.log(searchTerm);
    var searchUrl = 'https://api.alltomp3.org/v1/guess-track/' + searchTerm;
    var x = new XMLHttpRequest();
    x.open('GET', searchUrl);
    // The Google image search API responds with JSON, so let Chrome parse it.
    x.responseType = 'json';
    x.onload = function() {
      // Parse and process the response from Google Image Search.
      var response = x.response;
      if (!response || !response.title ||
          !response.artistName) {
        errorCallback('No suggestion for this video!');
        return;
      }
      var result = response
      var artist = result.artistName;
      var songTitle = result.title;
      callback(artist, songTitle);
    };
    x.onerror = function() {
      errorCallback('Network error.');
    };
    x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

  getCurrentTabTitle(function(title) {
    // Parse the title of the video
    // TODO: Use YouTube's metedata
    var components = title.split('-');
    if (components[components.length - 1] == " YouTube") {
        components.pop()
    }
    var searchTerm = components.join('-');
    parseTitle(searchTerm, function(artist, songTitle){
        renderStatus('Performing Lyrics.ovh search for artist:' + artist
                    + ', and song name:' + songTitle);

        getLyrics(artist, songTitle, function(lyrics) {
          renderStatus(lyrics);
        }, function(errorMessage) {
          renderStatus('Cannot display lyrics. ' + errorMessage);
        });
    }, function(errorMessage) {
      renderStatus('Cannot display lyrics. ' + errorMessage);
    });
  });
});
