var moment = require('moment'),
    util = require('../util.js');

function weekly(data){
    var works = {},
        start = moment().weekday(1)
            .hour(0)
            .minute(0)
            .second(0),
        end = moment().weekday(7)
            .hour(23)
            .minute(59)
            .second(59),
        filename = data.user.name + '-工作周报（' + start.format('YYYY年M月D日') + '至' + end.format('M月D日') + '）.log';

    data.projects.map(function(project){
        project.commits.map(function(commit){
            var created, results, cate, work, reg = /^[\[|【](.+)[\]|】](.+)$/i;
            if(-1 === commit.title.indexOf('Merge remote-tracking branch')){//非merge代码
                created = moment(commit.created_at);
                if(created.isAfter(start) && created.isBefore(end)){
                    results = reg.exec(commit.title);
                    if(results && results.length > 2){
                        cate = results[1];
                        work = results[2];
                    }else{
                        cate = project.name;
                        work = commit.title;
                    }
                    if(!works.hasOwnProperty(cate)){
                        works[cate] = [];
                    }
                    works[cate].push(work);
                }
            }
        });
    });
    
    var counter = 1, content = '本周工作：\n';
    for(var cate in works){
        content += '\t' + counter + '. 【' + cate + '】';
        content += works[cate].join(' ') + '\n';
        counter++;
    }

    util.save(filename, content)
    .then(function(data){
        console.log(data);
    })
    .fail(function(err){
        console.log(err.message);
    });
}

module.exports = weekly;