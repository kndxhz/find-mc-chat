<template>
  <div class="log-container">
    <div class="log-cards">
      <div
        v-for="(message, index) in parsedMessages"
        :key="index"
        class="log-card"
        @mouseenter="handleMessageHover(message, index, $event)"
        @mousemove="handleMouseMove(message, index, $event)"
        @mouseleave="handleMessageLeave(message, index, $event)"
      >
        <div class="log-card__time">{{ message.formatted_time }}</div>
        <div class="log-card__user-info">
          <span class="log-card__username">{{ message.username }}</span>
          <span v-if="message.user_alias" class="log-card__alias">
            {{ message.user_alias }}
          </span>
        </div>
        <div class="log-card__content">
          <p class="log-card__message">{{ message.message }}</p>
        </div>
      </div>
    </div>
    
    <!-- 全局悬浮提示框 -->
    <teleport to="body">
      <transition name="tooltip">
        <div
          v-if="showTooltip && hoveredLog >= 0"
          class="log-card__tooltip"
          :style="{ 
            left: tooltipPosition.x + 'px', 
            top: tooltipPosition.y + 'px' 
          }"
        >
          <slot name="tooltip" :message="parsedMessages[hoveredLog]" :index="hoveredLog">
            <!-- 默认的属性信息显示 -->
            <div class="tooltip-content">
              <div class="tooltip-header">
                <strong>{{ parsedMessages[hoveredLog]?.username }}</strong>
                <span v-if="parsedMessages[hoveredLog]?.user_alias" class="header-alias">
                  {{ parsedMessages[hoveredLog]?.user_alias }}
                </span>
              </div>
              <div class="tooltip-body">
                <div v-if="parsedMessages[hoveredLog]?.attribute" class="metadata-grid">
                  <template v-for="(attr, index) in parsedMessages[hoveredLog].attribute.split('|')" :key="index">
                    <div class="metadata-item" v-if="attr.trim()">
                      <span class="metadata-value">{{ attr.trim() }}</span>
                    </div>
                  </template>
                </div>
                
                <!-- 如果没有属性，显示提示 -->
                <div v-else class="no-attributes">
                  该用户暂无属性信息
                </div>
              </div>
            </div>
          </slot>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// 聊天记录数据
const messages = ref([
  {
    username: 'Player1',
    user_alias: '新手冒险者',
    message: '大家好！我是新来的玩家',
    attribute: '真实伤害：1|物理防御：3|魔法抗性：2',
    send_time: 1696400000000
  },
  {
    username: 'Admin',
    user_alias: '服务器管理员',
    message: '欢迎来到我们的服务器！',
    attribute: '真实伤害：99|物理防御：99|魔法抗性：99|特殊权限：管理员',
    send_time: 1696400005000
  },
  {
    username: 'Player2',
    user_alias: '挖矿专家',
    message: '有人要一起组队挖矿吗？我有好装备',
    attribute: '真实伤害：15|物理防御：8|挖掘效率：+3|幸运：+2',
    send_time: 1696400010000
  }
])

// 悬浮状态
const hoveredLog = ref(-1)
const showTooltip = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })

// 时间格式化函数
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

// 解析聊天记录格式
const parsedMessages = computed(() => {
  return messages.value.map(message => {
    // API数据格式
    if (typeof message === 'object' && message.username) {
      return {
        username: message.username,
        user_alias: message.user_alias || '',
        message: message.message,
        attribute: message.attribute || '',
        send_time: message.send_time,
        formatted_time: formatTime(message.send_time)
      }
    }
    
    // 兼容旧格式或其他格式
    return {
      username: message.sender || '未知用户',
      user_alias: '',
      message: message.content || message.message || '无消息内容',
      attribute: '',
      send_time: Date.now(),
      formatted_time: formatTime(Date.now())
    }
  })
})

// 鼠标悬浮处理函数
const handleMessageHover = (message, index, event) => {
  hoveredLog.value = index
  showTooltip.value = true
  
  // 使用 nextTick 确保 DOM 更新后再计算位置
  nextTick(() => {
    // 获取鼠标位置
    const mouseX = event.clientX
    const mouseY = event.clientY
    const rect = event.target.getBoundingClientRect()
    
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // 根据屏幕大小和DPI调整提示框尺寸
    let tooltipWidth = 350
    let tooltipHeight = 250
    
    // 高分辨率屏幕优化
    if (window.innerWidth >= 1920 || window.devicePixelRatio >= 2) {
      tooltipWidth = 400
      tooltipHeight = 280
    }
    
    if (window.innerWidth >= 2560 || window.devicePixelRatio >= 3) {
      tooltipWidth = 450
      tooltipHeight = 320
    }
    
    // 安全边距
    const margin = 15
    // 鼠标偏移量
    const mouseOffset = 10
    
    // 默认位置：鼠标右下方
    let x = mouseX + mouseOffset
    let y = mouseY + mouseOffset
    
    // 检查右边界，如果超出则放在鼠标左侧
    if (x + tooltipWidth > viewport.width - margin) {
      x = mouseX - tooltipWidth - mouseOffset
    }
    
    // 检查下边界，如果超出则放在鼠标上方
    if (y + tooltipHeight > viewport.height - margin) {
      y = mouseY - tooltipHeight - mouseOffset
    }
    
    // 如果左上角都不够空间，智能调整到最佳位置
    if (x < margin) {
      // 尝试卡片右侧
      x = rect.right + mouseOffset
      if (x + tooltipWidth > viewport.width - margin) {
        // 还是不够，就贴边显示
        x = viewport.width - tooltipWidth - margin
      }
    }
    
    if (y < margin) {
      // 尝试卡片下方
      y = rect.bottom + mouseOffset
      if (y + tooltipHeight > viewport.height - margin) {
        // 还是不够，就贴边显示
        y = viewport.height - tooltipHeight - margin
      }
    }
    
    // 最终边界保护
    x = Math.max(margin, Math.min(x, viewport.width - tooltipWidth - margin))
    y = Math.max(margin, Math.min(y, viewport.height - tooltipHeight - margin))
    
    tooltipPosition.value = { x, y }
    
    // 触发自定义事件，允许外部组件监听
    emit('message-hover', { message, index, event })
  })
}

// 鼠标移动处理函数 - 实时更新提示框位置
const handleMouseMove = (message, index, event) => {
  // 只有在提示框显示且是当前悬浮的卡片时才更新位置
  if (!showTooltip.value || hoveredLog.value !== index) return
  
  // 节流处理，避免过于频繁的更新
  clearTimeout(handleMouseMove.timer)
  handleMouseMove.timer = setTimeout(() => {
    updateTooltipPosition(event)
  }, 16) // 约60fps的更新频率
}

// 更新提示框位置的函数
const updateTooltipPosition = (event) => {
  const mouseX = event.clientX
  const mouseY = event.clientY
  const rect = event.target.getBoundingClientRect()
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  // 根据屏幕大小和DPI调整提示框尺寸
  let tooltipWidth = 350
  let tooltipHeight = 250
  
  if (window.innerWidth >= 1920 || window.devicePixelRatio >= 2) {
    tooltipWidth = 400
    tooltipHeight = 280
  }
  
  if (window.innerWidth >= 2560 || window.devicePixelRatio >= 3) {
    tooltipWidth = 450
    tooltipHeight = 320
  }
  const margin = 15
  const mouseOffset = 10
  
  // 默认位置：鼠标右下方
  let x = mouseX + mouseOffset
  let y = mouseY + mouseOffset
  
  // 边界检查和调整
  if (x + tooltipWidth > viewport.width - margin) {
    x = mouseX - tooltipWidth - mouseOffset
  }
  
  if (y + tooltipHeight > viewport.height - margin) {
    y = mouseY - tooltipHeight - mouseOffset
  }
  
  // 智能回退策略
  if (x < margin) {
    x = rect.right + mouseOffset
    if (x + tooltipWidth > viewport.width - margin) {
      x = viewport.width - tooltipWidth - margin
    }
  }
  
  if (y < margin) {
    y = rect.bottom + mouseOffset
    if (y + tooltipHeight > viewport.height - margin) {
      y = viewport.height - tooltipHeight - margin
    }
  }
  
  // 最终边界保护
  x = Math.max(margin, Math.min(x, viewport.width - tooltipWidth - margin))
  y = Math.max(margin, Math.min(y, viewport.height - tooltipHeight - margin))
  
  tooltipPosition.value = { x, y }
}

// 鼠标离开处理函数
const handleMessageLeave = (message, index, event) => {
  hoveredLog.value = -1
  showTooltip.value = false
  // 清除鼠标移动的定时器
  clearTimeout(handleMouseMove.timer)
  // 触发自定义事件，允许外部组件监听
  emit('message-leave', { message, index, event })
}

// 添加聊天记录的方法（API接口）
const addMessage = (messageData) => {
  // 确保数据格式正确
  const formattedMessage = {
    username: messageData.username,
    user_alias: messageData.user_alias || '',
    message: messageData.message,
    attribute: messageData.attribute || '',
    send_time: messageData.send_time
  }
  messages.value.push(formattedMessage)
  nextTick(() => {
    // 滚动到最新消息
    const container = document.querySelector('.log-cards')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// 清空聊天记录的方法
const clearMessages = () => {
  messages.value = []
}

// 批量添加消息
const setMessages = (messageList) => {
  messages.value = messageList
}

// 定义组件事件
const emit = defineEmits(['message-hover', 'message-leave', 'message-click'])

// 暴露方法给父组件使用
defineExpose({
  addMessage,
  clearMessages,
  setMessages,
  messages: parsedMessages
})
</script>

<style scoped>
.log-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 8px;
  border: 2px solid #404040;
  overflow: hidden;
  position: relative;
}

/* 确保提示框能够正确显示在所有元素之上 */
.log-card__tooltip {
  isolation: isolate;
}

.log-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 聊天记录卡片样式 */
.log-card {
  background: rgba(45, 45, 45, 0.8);
  border-radius: 6px;
  padding: 12px 16px;
  border-left: 3px solid #606060;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.log-card:hover {
  background: rgba(60, 60, 60, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border-left-color: #888;
}

/* 卡片时间 */
.log-card__time {
  color: #909399;
  font-size: 10px;
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  margin-bottom: 4px;
  line-height: 1.2;
}

/* 用户信息行 */
.log-card__user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.log-card__username {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background: rgba(128, 128, 128, 0.2);
  color: #c0c4cc;
  border: 1px solid rgba(128, 128, 128, 0.3);
}

.log-card__alias {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: normal;
  background: rgba(64, 158, 255, 0.2);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

/* 卡片内容 */
.log-card__content {
  color: #e8e8e8;
}

.log-card__message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

/* 悬浮提示框 */
.log-card__tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.7),
    0 4px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 350px;
  width: 350px;
  max-height: 250px;
  overflow-y: auto;
  pointer-events: none;
  transform-origin: center;
  box-sizing: border-box;
}

/* 高分辨率屏幕提示框尺寸优化 */
@media (min-width: 1920px), (-webkit-min-device-pixel-ratio: 2) {
  .log-card__tooltip {
    max-width: 400px;
    width: 400px;
    max-height: 280px;
  }
}

@media (min-width: 2560px), (-webkit-min-device-pixel-ratio: 3) {
  .log-card__tooltip {
    max-width: 450px;
    width: 450px;
    max-height: 320px;
    border-radius: 16px;
  }
}

.tooltip-content {
  padding: 12px 14px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 16px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  padding-bottom: 6px;
}

.tooltip-header strong {
  color: #c0c4cc;
}

.header-alias {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(64, 158, 255, 0.2);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.tooltip-body {
  color: #e8e8e8;
  font-size: 14px;
  line-height: 1.5;
}

.tooltip-body p {
  margin: 4px 0;
}

.tooltip-body strong {
  color: #c0c4cc;
}

.metadata-section {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.metadata-grid {
  display: grid;
  gap: 3px;
  margin-top: 4px;
}

.metadata-item {
  display: block;
  font-size: 13px;
  line-height: 1.4;
  padding: 4px 10px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
  margin: 1px 0;
  border-left: 3px solid rgba(64, 158, 255, 0.5);
}

.metadata-value {
  color: #e8e8e8;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-weight: 500;
}

.no-attributes {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 8px;
  font-size: 13px;
}

/* 过渡动画 */
.tooltip-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.tooltip-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.tooltip-enter-from {
  opacity: 0;
  transform: scale(0.85) translate(-5px, -5px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.9) translate(2px, 2px);
}

/* 提示框位置变化时的平滑过渡 */
.log-card__tooltip {
  transition: left 0.1s ease-out, top 0.1s ease-out;
}

/* 自定义滚动条样式 */
.log-cards::-webkit-scrollbar {
  width: 12px;
}

.log-cards::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 6px;
  border: 1px solid #404040;
}

.log-cards::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #606060 0%, #4a4a4a 100%);
  border-radius: 6px;
  border: 1px solid #505050;
  transition: all 0.3s ease;
}

.log-cards::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #707070 0%, #5a5a5a 100%);
  border-color: #409eff;
}

.log-cards::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #409eff 0%, #337ecc 100%);
}

/* Firefox滚动条样式 */
.log-cards {
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #2a2a2a;
}

/* 媒体查询响应式 */
@media (max-width: 768px) {
  .log-cards {
    padding: 12px;
    gap: 6px;
  }
  
  .log-card {
    padding: 10px 12px;
  }
  
  .log-card__message {
    font-size: 13px;
  }
  
  .log-card__time {
    font-size: 9px;
  }
  
  .log-card__username {
    font-size: 11px;
    padding: 1px 6px;
  }
  
  .log-card__alias {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .log-cards::-webkit-scrollbar {
    width: 8px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .log-card__message {
    font-size: 13px;
  }
  
  .log-cards::-webkit-scrollbar {
    width: 10px;
  }
}

@media (min-width: 1025px) {
  .log-card__message {
    font-size: 14px;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 1440px) {
  .log-card__time {
    font-size: 11px;
  }
  
  .log-card__username {
    font-size: 13px;
  }
  
  .log-card__alias {
    font-size: 12px;
  }
  
  .log-card__message {
    font-size: 15px;
  }
  
  .tooltip-content {
    padding: 14px 16px;
  }
  
  .tooltip-header {
    font-size: 17px;
  }
  
  .tooltip-body {
    font-size: 15px;
  }
  
  .metadata-item {
    font-size: 14px;
  }
  
  .header-alias {
    font-size: 13px;
  }
}

/* 超高分辨率屏幕 (2K/4K) */
@media (min-width: 1920px) {
  .log-card {
    padding: 14px 18px;
  }
  
  .log-card__time {
    font-size: 12px;
  }
  
  .log-card__username {
    font-size: 14px;
    padding: 3px 10px;
  }
  
  .log-card__alias {
    font-size: 13px;
    padding: 3px 8px;
  }
  
  .log-card__message {
    font-size: 16px;
    line-height: 1.5;
  }
  
  .log-cards {
    gap: 10px;
    padding: 20px;
  }
  
  .tooltip-content {
    padding: 16px 18px;
  }
  
  .tooltip-header {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .tooltip-body {
    font-size: 16px;
  }
  
  .metadata-item {
    font-size: 15px;
    padding: 5px 12px;
  }
  
  .header-alias {
    font-size: 14px;
  }
  
  .no-attributes {
    font-size: 14px;
    padding: 10px;
  }
}

/* 高DPI屏幕检测 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .log-card__time {
    font-size: 11px;
  }
  
  .log-card__username {
    font-size: 13px;
  }
  
  .log-card__alias {
    font-size: 12px;
  }
  
  .log-card__message {
    font-size: 15px;
  }
}

/* 超高DPI屏幕 (Retina等) */
@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 3dppx) {
  .log-card__time {
    font-size: 12px;
  }
  
  .log-card__username {
    font-size: 14px;
    padding: 3px 10px;
  }
  
  .log-card__alias {
    font-size: 13px;
    padding: 3px 8px;
  }
  
  .log-card__message {
    font-size: 16px;
    line-height: 1.5;
  }
  
  .log-card {
    padding: 14px 18px;
  }
  
  .log-cards {
    gap: 10px;
  }
  
  .tooltip-content {
    padding: 16px 18px;
  }
  
  .tooltip-header {
    font-size: 18px;
  }
  
  .tooltip-body {
    font-size: 16px;
  }
  
  .metadata-item {
    font-size: 15px;
  }
  
  .header-alias {
    font-size: 14px;
  }
}
</style>