var fs = require('fs'),
    path = require('path'),
    Q = require('q');

function read(){
    var deferred = Q.defer();
    fs.readFile(path.join(__dirname, '../grr.json'), function(err, data){
        var json;
        if(err){
            deferred.reject(err);
        }else{
            try{
                json = JSON.parse(data);
                deferred.resolve(json);
            }catch(ex){
                deferred.reject(ex);
            }
        }
    });
    return deferred.promise;
}

module.exports = {
    read: read
};