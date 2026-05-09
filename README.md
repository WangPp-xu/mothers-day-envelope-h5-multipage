# 母亲节多页信封 H5

这是一个可以直接上传到 GitHub Pages 的母亲节多页 H5 项目。

## 项目结构

```text
mothers-day-envelope-h5/
├─ index.html
├─ README.md
├─ .nojekyll
└─ assets/
   ├─ style.css
   ├─ script.js
   └─ music.README.txt
```

## 功能

- 可爱手绘贴纸风界面
- 多页面滑动切换效果
- 开场封面
- 祝福卡片页
- 回忆贴纸墙页
- 白色信封页
- 最终祝福页
- 白色信封从屏幕中间飞出来
- 点击信封后打开
- 信纸文字打字机效果
- 爱心漂浮动画
- 花瓣飘落动画
- 打开信封和最终页撒花
- 输入姓名、祝福语、落款生成专属贺卡
- 生成微信可分享专属链接
- 专属链接打开后隐藏编辑区域，只显示动画贺卡

## GitHub Pages 上传方法

1. 把本项目所有文件上传到仓库根目录。
2. 确认 `index.html` 在仓库最外层。
3. 进入仓库 Settings → Pages。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/ root`。
6. 保存后等待 1 到 5 分钟。

## 背景音乐

你可以准备一个音乐文件，命名为：

```text
music.mp3
```

放到：

```text
assets/music.mp3
```

微信内置浏览器通常不允许网页自动播放音乐，需要用户第一次点击页面或点击信封后才会播放。

## 专属链接格式

```text
https://你的用户名.github.io/你的仓库名/?mode=share&name=妈妈&msg=母亲节快乐&from=爱您的孩子
```

也可以在页面里填写内容后，点击“生成专属链接”，自动生成并复制到微信。
