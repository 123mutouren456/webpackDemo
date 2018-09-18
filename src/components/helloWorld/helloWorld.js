let template = `<div class="helloworld-comp"><h1>Hello World</h1></div>`;
exports.init = ()=>{
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(template);
        },1000)
    })
}