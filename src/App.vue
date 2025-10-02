<script setup lang="ts">
//import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import Main from './components/filter.vue';
import 'element-plus/es/components/message-box/style/css';
(async () => {
  const seenMessageBox = await cookieStore.get('seenMessageBox');
  if (seenMessageBox?.value !== 'true') {
    ElMessageBox.alert(
      "本站确保任何聊天记录不会被篡改、删除<br/>始终保持中立<br/>本站已在GitHub开源（补上链接）<br/>https://github.com/your-repository<br/>如有任何问题，请前往GitHub提交issue",
      "温馨提示",
      { 
        confirmButtonText: "我已确认",
        dangerouslyUseHTMLString: true
      }
    );
  } else {
    console.log("已确认过提示");
  }
  cookieStore.set('seenMessageBox', 'true');
})();
</script>

<template>
  <div class="app">
    <Main />
  </div>
</template>




<style lang="css">
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  background: #fafafa;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}
</style>
