var Q = require('q'),
    async = require('async'), 
    util = require('../util.js');

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

function createCommitsFetcher(user, project){
    return function(callback){
        var api = ['projects', project.id, 'repository', 'commits'].join('/');
        util.get(api)
        .then(function(commits){
            var results = [];
            commits.map(function(commit){
                if(commit.author_email === user.email || commit.author_email === 'peigong@foxmail.com'){
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

function createContributorsFetcher(user, project){
    return function(callback){
        var api = ['projects', project.id, 'repository', 'contributors'].join('/');
        util.get(api)
        .then(function(contributors){
            var o = {};
            contributors.map(function(contributor){
                if(contributor.email === user.email || contributor.email === 'peigong@foxmail.com'){
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

function filterProjectsByUser(user, projects){
    var data = {},
        deferred = Q.defer();
    data.user = user;
    data.projects = [];
    var tasks = projects.map(function(project){
        return function(callback){
            if(project.namespace.name === user.username){
                callback(null, null);
            }else{
                async.parallel({
                    'contributor': createContributorsFetcher(user, project),
                    'commits': createCommitsFetcher(user, project)
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
            }
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
        user: getUser,
        projects: getProjects
    }, function(err, results){
        if(err){
            deferred.reject(err);
        }else{
            filterProjectsByUser(results.user, results.projects)
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