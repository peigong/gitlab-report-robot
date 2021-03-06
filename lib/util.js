var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    request = require('request'),
    config = require('./config.js');

function get(api){
    var deferred = Q.defer();
    config.read()
    .then(function(settings){
        var options = {
            url: [settings.gitlab, 'api', 'v3', api].join('/'),
            headers: {
                'PRIVATE-TOKEN': settings.token
            }
        };
        request(options, function(err, response, body){
            var json;
            if (!err && response.statusCode == 200) {
                try{
                    json = JSON.parse(body);
                    deferred.resolve(json);
                }catch(ex){
                    deferred.reject(ex);
                }
            }else{
                err = err || response.statusCode;
                deferred.reject(err);
            }
        });
    })
    .fail(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
}

function save(filename, data){
    var deferred = Q.defer(),
        cwd = process.cwd(),
        filename = path.join(cwd, filename);

    fs.writeFile(filename, data, function(err){
        if (err){
            deferred.reject(err);
        }else{
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

module.exports = {
    get: get,
    save: save
};