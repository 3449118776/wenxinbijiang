// 测试大模型API是否有对话记忆
// 第一次调用说一些信息，第二次调用只提问，看AI记不记得

async function testConversationMemory() {
  const apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
  const model = 'Qwen/Qwen2.5-7B-Instruct';
  
  console.log('=== 测试大模型对话记忆 ===\n');
  
  // 第一轮：告诉AI一些信息
  console.log('【第一轮】告诉AI：我叫小明，今年25岁，住在北京');
  const res1 = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-free'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: '你好，我叫小明，今年25岁，住在北京。' }
      ],
      max_tokens: 100
    })
  });
  
  const data1 = await res1.json();
  if (data1.choices && data1.choices[0]) {
    console.log('AI回复：', data1.choices[0].message.content, '\n');
  } else {
    console.log('第一轮调用失败：', JSON.stringify(data1));
    return;
  }
  
  // 第二轮：只提问，不包含之前的信息
  console.log('【第二轮】只问：我叫什么名字？今年多大？住在哪里？');
  console.log('（注意：这次请求只发了这一条消息，没有带上轮对话）');
  
  const res2 = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-free'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: '我叫什么名字？今年多大？住在哪里？' }
      ],
      max_tokens: 100
    })
  });
  
  const data2 = await res2.json();
  if (data2.choices && data2.choices[0]) {
    console.log('AI回复：', data2.choices[0].message.content, '\n');
    
    // 判断是否记住了
    const reply = data2.choices[0].message.content;
    if (reply.includes('小明') || reply.includes('25') || reply.includes('北京')) {
      console.log('✅ 结论：AI有对话记忆，能记住之前说的内容');
    } else {
      console.log('❌ 结论：AI没有对话记忆，每次调用都是独立的');
    }
  } else {
    console.log('第二轮调用失败：', JSON.stringify(data2));
  }
  
  // 第三轮：带上对话历史再问一次（作为对照）
  console.log('\n【第三轮】带上完整对话历史再问一次（对照实验）');
  const res3 = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-free'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: '你好，我叫小明，今年25岁，住在北京。' },
        { role: 'assistant', content: data1.choices[0].message.content },
        { role: 'user', content: '我叫什么名字？今年多大？住在哪里？' }
      ],
      max_tokens: 100
    })
  });
  
  const data3 = await res3.json();
  if (data3.choices && data3.choices[0]) {
    console.log('AI回复：', data3.choices[0].message.content, '\n');
    console.log('✅ 对照实验：带上对话历史后，AI能正确回答');
  }
}

testConversationMemory().catch(console.error);
