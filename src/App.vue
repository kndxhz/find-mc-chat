<script setup lang="ts">
import { ElMessage, ElMessageBox, ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import Main from './components/filter.vue';
import 'element-plus/es/components/message-box/style/css';

(async () => {
  const seenMessageBox = await cookieStore.get('seenMessageBox');
  if (seenMessageBox?.value !== 'true') {
    ElMessageBox.alert(
      "本站确保任何聊天记录不会被篡改、删除<br/>始终保持中立<br/>本站已在GitHub开源<br/>https://github.com/kndxhz/find-mc-chat<br/>如有任何问题，请前往GitHub提交issue",
      "温馨提示",
      { 
        confirmButtonText: "我已知晓并不再显示",
        dangerouslyUseHTMLString: true
      }
    );
    cookieStore.set('seenMessageBox', 'true');
  }
})();
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <Main />
    </div>
  </el-config-provider>
</template>

<style lang="css">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  background: #fafafa;
  overflow: hidden;
}
</style>
