alert("hello!欢迎登陆tsc!");

const menu=document.querySelector(".menu");
let aaa=false;
menu.addEventListener("click",function (e){
    const 汉堡菜单=document.querySelector(".汉堡菜单");
    if(aaa === false){
        aaa=true;
        汉堡菜单.innerHTML=`
            <li><a href="index.html">        首页             </a></li>
            <li><a href="bxhelp.html">  熟悉服务器         </a></li>

    }

    //const 状态
});
