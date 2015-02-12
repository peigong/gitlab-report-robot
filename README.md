# GitLab工作报告自动生成工具 #

	grr config ./conf.json

	grr config gitlab=http://gitlab.example.com
	grr config token=a1b2c3d4e5f6

	grr 生成本周的工作周报
	grr -nw 生成前n周工作周报
	grr a 生成全部的工作报告

## 代码提交时的日志信息规范 ##

日志信息需要按如下格式填写：

	【项目名称】代码更改的主题
	具体需要说明的细节

说明：

- 中括号中的内容是准备写入工作报告的项目名称（中括号可以使用中文括号，也可以使用英文括号）。
- 中括号后面的内容是准备写入工作报告的内容。
- 其他需要说明的细节需要换行书写。
