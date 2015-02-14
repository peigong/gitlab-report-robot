var model = require('../lib/models/report.js');

model.getReport()
.then(function(data){
    var content = '', project, commits = 0, changed = 0;
    content  += '参与项目：' + data.projects.length + '个\n';
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
    content  += '代码提交：' + commits + '次\n';
    content  += '代码变更：' + changed + '行\n';
    console.log(content);
})
.fail(function(err){
    console.log(err);
});