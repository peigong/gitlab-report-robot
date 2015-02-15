var Q = require('q'),
    async = require('async'),
    _ = require('underscore'),
    util = require('../util.js'),
    config = require('../config.js');

function readConfig(callback){
    config.read()
    .then(function(settings){
        callback(null, settings);
    })
    .fail(function(err){
        callback(err);
    });
}

function getUser(callback){
    util.get('user')
    .then(function(user){
        var o = {};
        o.id = user.id;
        o.name = user.name;
        o.username = user.username;
        o.email = user.email;
        callback(null, o);
    })
    .fail(function(err){
        callback(err);
    });
}

function getProjects(callback){
    util.get('projects')
    .then(function(projects){
        callback(null, projects);
    })
    .fail(function(err){
        callback(err);
    });
}

function getEmailList(settings, user){
    var results = [];
    if(user.email){
        results.push(user.email);
    }
    if(settings.email){
        if(_.isString(settings.email)){
            results.push(settings.email);
        }
        if(_.isArray(settings.email)){
            results = results.concat(settings.email);
        }
    }
    results = _.compact(results);
    results = _.uniq(results);
    return results;
}

function createCommitsFetcher(settings, user, project){
    return function(callback){
        var api = ['projects', project.id, 'repository', 'commits'].join('/');
        util.get(api)
        .then(function(commits){
            var results = [], emails = getEmailList(settings, user);
            commits.map(function(commit){
                if(_.indexOf(emails, commit.author_email) > -1){
                    results.push(commit);
                }
            });
            callback(null, results);
        })
        .fail(function(err){
            callback(err);
        });
    };
}

function createContributorsFetcher(settings, user, project){
    return function(callback){
        var api = ['projects', project.id, 'repository', 'contributors'].join('/');
        util.get(api)
        .then(function(contributors){
            var o = {}, emails = getEmailList(settings, user);
            contributors.map(function(contributor){
                if(_.indexOf(emails, contributor.email) > -1){
                    o.commits = contributor.commits;
                    o.additions = contributor.additions;
                    o.deletions = contributor.deletions;
                }
            });
            callback(null, o);
        })
        .fail(function(err){
            callback(err);
        });
    };
}

function filterProjectsByUser(settings, user, projects){
    var data = {},
        deferred = Q.defer();
    data.user = user;
    data.projects = [];
    var tasks = projects.map(function(project){
        return function(callback){
            async.parallel({
                'contributor': createContributorsFetcher(settings, user, project),
                'commits': createCommitsFetcher(settings, user, project)
            }, function(err, results){
                var o;
                if(err){
                    callback(err);
                }else{
                    o = {};
                    o.id = project.id;
                    o.name = project.name;
                    o.name_with_namespace = project.name_with_namespace;
                    o.contributor = results.contributor || {};
                    o.commits = results.commits || [];
                    callback(null, o);
                }
            });
        };
    });
    async.parallel(tasks, function(err, results){
        var o;
        if(err){
            deferred.reject(err);
        }else{
            for (var i = 0; i < results.length; i++) {
                o = results[i];
                if(!!o){
                    data.projects.push(o);
                }
            };
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

function getReport(){
    var deferred = Q.defer();
    async.parallel({
        settings: readConfig,
        user: getUser,
        projects: getProjects
    }, function(err, results){
        if(err){
            deferred.reject(err);
        }else{
            filterProjectsByUser(results.settings, results.user, results.projects)
            .then(function(data){
                deferred.resolve(data);
            })
            .fail(function(err){
                deferred.reject(err);
            });
        }
    });
    return deferred.promise;
}

module.exports = {
    getReport: getReport
};