addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    // 预检请求。回应它！
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        // 允许的方法
        'Access-Control-Allow-Methods': 'GET,POST',
        // 允许的头部信息
        'Access-Control-Allow-Headers': 'content-type',
      },
    })
  }
  let response;
  console.log(request.method);
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
      const aicontent = "当前文章未初始化，url:"+ realurl +",md5:"+ contentmd5 +",复制以下内容：你是一个摘要生成工具，你需要解释我发送给你的内容，不要换行，不要超过100字，只需要介绍文章的内容，不需要提出建议和缺少的东西。请用中文回答，输出的内容开头为“这篇文章介绍了”：" + content
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
        const aicontent = "当前文章已被更改，需要重新初始化，url:"+ realurl +",md5:"+ contentmd5 +",复制以下内容：你是一个摘要生成工具，你需要解释我发送给你的内容，不要换行，不要超过100字，只需要介绍文章的内容，不需要提出建议和缺少的东西。请用中文回答，输出的内容开头为“这篇文章介绍了”：" + content
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
    const realurl = parsedContent["url"];
    // if (realurl.endsWith("index.html")) {
    //   realurl = realurl.replace(/index\.html$/, "");
    // }
    const contentmd5 = await processtomd5(content)
    const aiconentjson = await readdata(realurl)
    if (aiconentjson == null) {
      let aicontent = "当前文章未初始化，url:"+ realurl +",md5:"+ contentmd5 +",复制以下内容：你是一个摘要生成工具，你需要解释我发送给你的内容，不要换行，不要超过100字，只需要介绍文章的内容，不需要提出建议和缺少的东西。请用中文回答，输出的内容开头为“这篇文章介绍了”：" + content
      response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
        headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
      });
    }else{
      const aimd5 = aiconentjson["md5"];
      let aicontent = aiconentjson["content"];
      console.log("aimd5:" + aimd5 + " contentmd5:" + contentmd5)
      if (aimd5 == contentmd5){
        response = new Response(JSON.stringify({ id: 114514,summary: aicontent,user_openid: "",err_msg: "",error_id: "" }), {
          headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*'},
        });
      }else{
        const aicontent = "当前文章已被更改，需要重新初始化，url:"+ realurl +",md5:"+ contentmd5 +",复制以下内容：你是一个摘要生成工具，你需要解释我发送给你的内容，不要换行，不要超过150字，只需要介绍文章的内容，不需要提出建议和缺少的东西。请用中文回答，输出的内容开头为“这篇文章介绍了”：" + content
        response = new Response(JSON.stringify({id: contentmd5,summary: aicontent,user_openid: "" ,err_msg: "", error_id: ""}), {
          headers: { 'content-type': 'application/json','Access-Control-Allow-Origin': '*' },
        });
      }
    }
  } else {
    response = new Response('Method not supported', { status: 405 });
  }
  return response;
}

//读取
async function readdata(key) {
  try {
    // @ts-ignore
    let data = await KV.get(key)
    if (data === undefined) {
      console.log(`No data found for key: ${key}`);
    } else {
      data = escapeJsonString(data)
      console.log(`${key}:${data}`);
      data = JSON.parse(data)
      return data;
    }
  } catch (error) {
    console.error(`Error reading data for key ${key}:`, error);
  }
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

function escapeJsonString(jsonString) {
  // 转义特殊字符
  // let escapedString = jsonString.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  // 去除控制字符
  jsonString = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return jsonString;
}
