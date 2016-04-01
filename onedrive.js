/*global require,exports,console,module*/

'use strict';

var restler = require('restler');
var https = require('https');

var onedrive = {};

onedrive.getToken = function(callback) {
    console.log('[Onedrive getToken] start');
    var dataToSend =
        'client_id=changeme_with_your_client_id' +
        '&redirect_uri=changeme_with_your_redirect_uri' +
        '&client_secret=changeme_with_a_valid_client_secret' +
        '&refresh_token=changeme_with_a_valid_refresh_token' +
        '&grant_type=refresh_token';

    restler.post('https://login.live.com/oauth20_token.srf', {
        data: dataToSend
    }).on('complete', function(data, response) {
        console.log('[Onedrive getToken] response refresh statusCode', response.statusCode);
        console.log('[Onedrive getToken] refreshed token: ', data.access_token);
        if (response.statusCode == 200) {
            callback.success(data.access_token);
        } else {
            callback.error(response.statusCode);
        }
    });
};

onedrive.getEditLink = function(fileName, access_token, callback) {
    console.log('[Onedrive getEditLink] start');

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/' + fileName + '/shared_edit_link?access_token=' + access_token,
        method: 'GET',
        headers: {
            'Content-Type': ''
        }
    };

    var editLink = https.request(options, function(response) {
        console.log('[Onedrive getEditLink] STATUS: ' + response.statusCode);
        // console.log('[Onedrive getEditLink] shareLink HEADERS: ' + JSON.stringify(response.headers));
        if (response.statusCode == 200) {

            var body = '';

            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                console.log('[Onedrive getEditLink] data', JSON.parse(body).link);

                callback.success(JSON.parse(body).link);
            });
        } else {
            callback.error(response.statusCode);
        }
    }).on('error', function(e) {
        console.error('[Onedrive getEditLink]  error', e);
    });

    editLink.end();
};

onedrive.deleteFIle = function(fileName, access_token, callback) {
    console.log('[Onedrive deleteFIle] start');

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/' + fileName + '?access_token=' + access_token,
        method: 'DELETE'
    };

    var deleteFileOnOneDrive = https.request(options, function(response) {
        console.log('[Onedrive deleteFIle] STATUS: ' + response.statusCode);
        // console.log('[Onedrive deleteFIle] HEADERS: ' + JSON.stringify(response.headers));
        if (response.statusCode == 204 || response.statusCode == 200) {
            var body = '';

            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                callback.success();
            });
        } else {
            callback.error(response.statusCode);
        }
    }).on('error', function(e) {
        console.error('[Onedrive deleteFIle]  error', e);
    });

    deleteFileOnOneDrive.end();
};

onedrive.getDownloadLink = function(fileName, access_token, callback) {
    console.log('[Onedrive getDownloadLink] start');

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/' + fileName + '/content?suppress_redirects=true&access_token=' + access_token,
        method: 'GET',
        headers: {
            'Content-Type': ''
        }
    };

    var editLink = https.request(options, function(response) {
        console.log('[Onedrive getDownloadLink]  STATUS: ' + response.statusCode);
        // console.log('[Onedrive getDownloadLink]  HEADERS: ' + JSON.stringify(response.headers));
        if (response.statusCode == 200) {

            var body = '';

            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                console.log('[Onedrive getDownloadLink] file data', JSON.parse(body).location);
                callback.success(JSON.parse(body).location);
            });
        } else {
            callback.error(response.statusCode);
        }
    }).on('error', function(e) {
        console.error('[Onedrive getDownloadLink]  error', e);
    });

    editLink.end();
};


onedrive.copyFile = function(fileType, fodler, access_token, callback) {
    console.log('[Onedrive copyFile] start');

    var newFile = '';

    switch (fileType) {
        case 'txt':
            newFile = 'file.6b9a67a5e8b9e1db.6B9A67A5E8B9E1DB!119';
            break;
        case 'pptx':
            newFile = 'file.6b9a67a5e8b9e1db.6B9A67A5E8B9E1DB!116';
            break;
        case 'docx':
            newFile = 'file.6b9a67a5e8b9e1db.6B9A67A5E8B9E1DB!108';
            break;
        case 'xlsx':
            newFile = 'file.6b9a67a5e8b9e1db.6B9A67A5E8B9E1DB!113';
            break;
        default:
            newFile = 'file.6b9a67a5e8b9e1db.6B9A67A5E8B9E1DB!119';
    }

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/' + newFile + '?overwrite=ChooseNewName',
        method: 'COPY',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=UTF-8'
        }
    };
    console.log('[Onedrive copyFile] options', options);

    var copyFile = https.request(options, function(response) {
        console.log('[Onedrive copyFile] Create file statusCode', response.statusCode);
        console.log('[Onedrive copyFile] Create file response.headers', JSON.stringify(response.headers));

        if (response.statusCode == 201) {
            var body = '';

            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                // console.log('[Files copyFile] Create file data', JSON.parse(body));

                callback.success(body);
            });
        } else {
            callback.error(response.statusCode);
        }
    }).on('error', function(e) {
        console.error('[Onedrive copyFile]  error', e);
    });

    console.log('[Onedrive copyFile] writing', '{"destination" : "' + fodler.folder_id + '"}');
    copyFile.write('{"destination" : "' + fodler.folder_id + '"}');
    copyFile.end();
};


onedrive.renameFile = function(serverFileName, newfileName, access_token, callback) {
    console.log('[Onedrive renameFile] start');
    rename(serverFileName, newfileName, access_token, callback, 0);
};

function rename(serverFileName, newfileName, access_token, callback, retryNumber) {
    var filetype = '';
    var nameFile = '';

    if (retryNumber > 0) {
        filetype = newfileName.split('.').pop();
        nameFile = newfileName.substr(0, newfileName.lastIndexOf('.')) || newfileName;
        newfileName = nameFile + '(' + new Date().getTime() + ')' + '.' + filetype;
    }

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/' + serverFileName,
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=UTF-8'
        }
    };

    var renameFileCall = https.request(options, function(response) {
        console.log('[Onedrive renameFile]  STATUS: ' + response.statusCode);
        // console.log('[Onedrive renameFile]  HEADERS: ' + JSON.stringify(response.headers));
        if (response.statusCode == 200) {

            var body = '';

            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                console.log('[Onedrive renameFile] file data', body);
                callback.success(newfileName);
            });
        } else {
            if (response.statusCode == 400) {
                rename(serverFileName, newfileName, access_token, callback, retryNumber + 1);
            } else {
                callback.error(response.statusCode);
            }
        }
    }).on('error', function(e) {
        console.error('[Onedrive renameFile]  error', e);
    });

    renameFileCall.write('{"name" : "' + newfileName + ' "}');
    renameFileCall.end();
}

onedrive.createFolder = function(facebookUserId, folderName, access_token, callback) {
    console.log('[Onedrive createFolder] start for user', facebookUserId);

    var options = {
        host: 'apis.live.net',
        path: '/v5.0/me/skydrive',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=UTF-8'
        }
    };

    var newFolder = https.request(options, function(response) {
        console.log('[Onedrive createFolder] Create folder statusCode', response.statusCode);
        if (response.statusCode == 201) {
            var body = '';

            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                var responseData = JSON.parse(body);
                console.log('[Onedrive createFolder] folder id', responseData.id);

                callback.success(responseData.id);
            });
        } else {
            callback.error(response.statusCode);
        }
    }).on('error', function(e) {
        console.error('[Onedrive createFolder]  error', e);
    });
    newFolder.write('{"name" : "' + folderName + '"}');
    newFolder.end();
};

// Exports
module.exports = onedrive;