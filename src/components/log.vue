<template>
  <el-input
    type="textarea"
    :model-value="logText"
    readonly
    ref="logTextarea"
    size="large"
    class="log-textarea"
    resize="none"
  />
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElInput } from 'element-plus'
import 'element-plus/es/components/input/style/css'

const logs = ref([
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  '[12:00:00] [INFO] 服务启动成功',
  '[12:00:01] [ERROR] 数据库连接失败',
  // ...
])

const logText = ref('')
const logTextarea = ref(null)

watch(logs, () => {
  logText.value = logs.value.join('\n')
  nextTick(() => {
    const textarea = document.querySelector('.log-textarea textarea')
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight
    }
  })
}, { deep: true, immediate: true })
</script>

<style scoped>
.log-textarea {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.log-textarea :deep(textarea) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #e8e8e8;
  resize: none !important;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  box-sizing: border-box;
  height: 100% !important;
  width: 100%;
  border: 2px solid #404040;
  border-radius: 8px;
  overflow-y: auto !important;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  flex: 1;
}

.log-textarea :deep(textarea):focus {
  border-color: #409eff;
  box-shadow: 
    0 0 0 3px rgba(64, 158, 255, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  outline: none;
}

/* 自定义滚动条样式 */
.log-textarea :deep(textarea)::-webkit-scrollbar {
  width: 12px;
}

.log-textarea :deep(textarea)::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 6px;
  border: 1px solid #404040;
}

.log-textarea :deep(textarea)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #606060 0%, #4a4a4a 100%);
  border-radius: 6px;
  border: 1px solid #505050;
  transition: all 0.3s ease;
}

.log-textarea :deep(textarea)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #707070 0%, #5a5a5a 100%);
  border-color: #409eff;
}

.log-textarea :deep(textarea)::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #409eff 0%, #337ecc 100%);
}

/* Firefox滚动条样式 */
.log-textarea :deep(textarea) {
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #2a2a2a;
}

/* 媒体查询响应式 */
@media (max-width: 768px) {
  .log-textarea :deep(textarea) {
    font-size: 12px;
    padding: 12px;
  }
  
  .log-textarea :deep(textarea)::-webkit-scrollbar {
    width: 8px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .log-textarea :deep(textarea) {
    font-size: 13px;
  }
  
  .log-textarea :deep(textarea)::-webkit-scrollbar {
    width: 10px;
  }
}

@media (min-width: 1025px) {
  .log-textarea :deep(textarea) {
    font-size: 14px;
  }
}
</style>