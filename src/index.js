addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  let response;

  if (request.method === 'GET') {

    const url = new URL(request.url);
    const content = url.searchParams.get('content');
    // const key = url.searchParams.get('key');
    let  realurl = url.searchParams.get('url');
    // if (realurl.endsWith("index.html")) {
    //   realurl = realurl.replace(/index\.html$/, "");
    // }
    const contentmd5 = await processtomd5(content)
    const aiconentjson = await readdata(realurl)
    if (aiconentjson == null) {
      const aicontent = "当前文章未初始化，url:"+ realurl +",md5:"+ contentmd5 +",内容：" + content
      response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
        headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
      });
    }else{
      const aimd5 = aiconentjson["md5"];
      const aicontent = aiconentjson["content"];
      if (aimd5 == contentmd5){
        response = new Response(JSON.stringify({ id: 114514,summary: aicontent,user_openid: "",err_msg: "",error_id: "" }), {
          headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
        });
      }else{
        const aicontent = "当前文章已被更改，需要重新初始化，url:"+ realurl +",md5:"+ contentmd5 +",内容：" + content
        response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
          headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*' },
        });
      }
    }
  } else if (request.method === 'POST') {
    const reqcontent = await request.text();
    const parsedContent = JSON.parse(reqcontent);
    const content = parsedContent["content"];
    // const key = parsedContent["key"];
    let realurl = parsedContent["url"];
    // if (realurl.endsWith("index.html")) {
    //   realurl = realurl.replace(/index\.html$/, "");
    // }
    const contentmd5 = await processtomd5(content)
    const aiconentjson = await readdata(realurl)
    if (aiconentjson == null) {
      let aicontent = "当前文章未初始化，url:"+ realurl +",md5:"+ contentmd5 +",内容：" + content
      response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
        headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
      });
    }else{
      const aimd5 = aiconentjson["md5"];
      let aicontent = aiconentjson["content"];
      if (aimd5 == contentmd5){
        response = new Response(JSON.stringify({ id: 114514,summary: aicontent,user_openid: "",err_msg: "",error_id: "" }), {
          headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
        });
      }else{
        const aimd5 = aiconentjson["md5"];
        const aicontent = aiconentjson["content"];
        if (aimd5 == contentmd5){
          response = new Response(JSON.stringify({ id: 114514,summary: aicontent,user_openid: "",err_msg: "",error_id: "" }), {
            headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
          });
        }else{
          const aicontent = "当前文章已被更改，需要重新初始化，url:"+ realurl +",md5:"+ contentmd5 +",内容：" + content
          response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
            headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*' },
          });
        }
      }
    }
  } else {
    response = new Response('Method not supported', { status: 405 });
  }
  return response;
}

//读取
async function readdata(url) {
  // @ts-ignore
  let data = await KV.get(url)
  console.log(data)
  if (!data) {
    return null
  }
  // const parsedContent = JSON.parse(data);
  // const md5 = parsedContent["md5"];
  // const content = parsedContent["content"];
  return data
}

async function processtomd5(text) {
  // 创建一个新的TextEncoder实例
  const encoder = new TextEncoder()

  // 将文本转换为UTF-8编码的Uint8Array
  const data = encoder.encode(text)

  // 使用Web Crypto API计算MD5哈希
  const hashBuffer = await crypto.subtle.digest('MD5', data)

  // 将哈希转换为16进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}