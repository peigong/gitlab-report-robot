var util = require('../util.js');

function overview(data){
    var content = '', project, commits = 0, changed = 0;
    content  += '参与项目：\t' + data.projects.length + '\t个\n';
    for (var i = 0; i < data.projects.length; i++) {
        project = data.projects[i];
        if(project.contributor){
            if(project.contributor.commits){
                commits += project.contributor.commits
            }
            if(project.contributor.additions){
                changed += project.contributor.additions
            }
            if(project.contributor.deletions){
                changed += project.contributor.deletions
            }
        }
    };
    content  += '提交代码：\t' + commits + '\t次\n';
    content  += '变更代码：\t' + changed + '\t行\n';

    util.save('overview.log', content)
    .then(function(data){
        console.log(data);
    })
    .fail(function(err){
        console.log(err.message);
    });
}

module.exports = overview;