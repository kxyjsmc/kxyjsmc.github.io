// 获取所有轮播相关元素
const 轮播项列表 = document.querySelectorAll('.轮播项');
const 指示器点列表 = document.querySelectorAll('.指示器点');
const 上一张按钮 = document.querySelector('.上一张');
const 下一张按钮 = document.querySelector('.下一张');

// 当前激活的轮播索引
let 当前索引 = 0;
// 自动轮播定时器
let 轮播定时器 = null;

// 切换到指定索引的轮播图函数
function 切换到指定轮播(目标索引) {
    // 移除当前激活状态
    轮播项列表[当前索引].classList.remove('active');
    指示器点列表[当前索引].classList.remove('active');
    
    // 更新索引边界判断
    当前索引 = 目标索引;
    if (当前索引 >= 轮播项列表.length) 当前索引 = 0;
    if (当前索引 < 0) 当前索引 = 轮播项列表.length - 1;
    
    // 给新索引添加激活状态
    轮播项列表[当前索引].classList.add('active');
    指示器点列表[当前索引].classList.add('active');
}

// 自动轮播启动函数
function 启动自动轮播() {
    // 先清除已有定时器避免重复
    clearInterval(轮播定时器);
    // 每5秒自动切换下一张
    轮播定时器 = setInterval(() => {
        切换到指定轮播(当前索引 + 1);
    }, 5000);
}

// 手动切换事件绑定
下一张按钮.addEventListener('click', () => {
    切换到指定轮播(当前索引 + 1);
    启动自动轮播(); // 手动操作后重置计时
});

上一张按钮.addEventListener('click', () => {
    切换到指定轮播(当前索引 - 1);
    启动自动轮播();
});

// 指示器点击切换
指示器点列表.forEach((点元素, 索引) => {
    点元素.addEventListener('click', () => {
        切换到指定轮播(索引);
        启动自动轮播(); // 点击指示器后重置计时
    });
});

// 页面加载完成后启动自动轮播
window.addEventListener('load', 启动自动轮播);
