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
        <div class="log-card__main">
          <div class="log-card__left">
            <div class="log-card__header">
              <span class="log-card__username">{{ message.username }}</span>
              <span v-if="message.user_alias" class="log-card__alias">
                {{ message.user_alias }}
              </span>
              <span class="log-card__time">{{ message.formatted_time }}</span>
            </div>
            <div class="log-card__content">
              <p class="log-card__message">{{ message.message }}</p>
            </div>
          </div>
          <div class="log-card__right">
            <div class="log-card__stats">
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-value">{{ getPlayerCount(message.players) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">TPS</span>
                <span class="stat-value" :class="getTpsClass(message.tps)">
                  {{ message.tps ? message.tps.toFixed(1) : '--' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全局悬浮提示框 -->
    <teleport to="body">
      <transition name="tooltip">
        <div
          v-show="showTooltip && hoveredLog >= 0"
          class="log-card__tooltip"
          :style="{ 
            left: tooltipPosition.x + 'px', 
            top: tooltipPosition.y + 'px'
          }"
          @mouseenter="handleTooltipMouseEnter"
          @mouseleave="handleTooltipMouseLeave"
        >
          <slot name="tooltip" :message="parsedMessages[hoveredLog]" :index="hoveredLog">
            <!-- 新的三区块布局 -->
            <div class="tooltip-content">

              <div class="tooltip-header">
                <div class="tooltip-header-left">
                  <strong>{{ parsedMessages[hoveredLog]?.username }}</strong>
                  <span v-if="parsedMessages[hoveredLog]?.user_alias" class="header-alias">
                    {{ parsedMessages[hoveredLog]?.user_alias }}
                  </span>
                </div>
                <span class="tooltip-time">{{ parsedMessages[hoveredLog]?.formatted_time }}</span>
              </div>
              
              <div class="tooltip-sections">
                <!-- 第一块：属性 -->
                <div class="tooltip-section">
                  <div class="section-title">属性</div>
                  <div class="section-content">
                    <div v-if="hoveredMessageAttributes.length > 0" class="attributes-list">
                      <div 
                        v-for="(attribute, index) in hoveredMessageAttributes" 
                        :key="index"
                        class="attribute-item"
                      >
                        {{ attribute }}
                      </div>
                    </div>
                    <div v-else class="no-data">无属性</div>
                  </div>
                </div>
                
                <!-- 分割线 -->
                <div class="section-divider"></div>
                
                <!-- 第二块：当前玩家 -->
                <div class="tooltip-section">
                  <div class="section-title">在线玩家(非实时)</div>
                  <div class="section-content">
                    <div v-if="hoveredMessagePlayers.length > 0" class="players-list">
                      <div 
                        v-for="(playerName, index) in hoveredMessagePlayers" 
                        :key="index"
                        class="player-item"
                      >
                        {{ playerName }}
                      </div>
                    </div>
                    <div v-else class="no-data">无玩家数据</div>
                  </div>
                </div>
                
                <!-- 分割线 -->
                <div class="section-divider"></div>
                
                <!-- 第三块：TPS -->
                <div class="tooltip-section">
                  <div class="section-title">TPS(非实时)</div>
                  <div class="section-content">
                    <div class="tps-info">
                      <div class="tps-item">
                        <span class="tps-label">当前TPS:</span>
                        <span class="tps-value" :class="getTpsClass(parsedMessages[hoveredLog]?.tps)">
                          {{ parsedMessages[hoveredLog]?.tps?.toFixed(1) }}
                        </span>
                      </div>
                      <div class="tps-item">
                        <span class="tps-label">1分钟:</span>
                        <span class="tps-value" :class="getTpsClass(parsedMessages[hoveredLog]?.tps_1)">
                          {{ parsedMessages[hoveredLog]?.tps_1?.toFixed(1) }}
                        </span>
                      </div>
                      <div class="tps-item">
                        <span class="tps-label">5分钟:</span>
                        <span class="tps-value" :class="getTpsClass(parsedMessages[hoveredLog]?.tps_5)">
                          {{ parsedMessages[hoveredLog]?.tps_5?.toFixed(1) }}
                        </span>
                      </div>
                      <div class="tps-item">
                        <span class="tps-label">15分钟:</span>
                        <span class="tps-value" :class="getTpsClass(parsedMessages[hoveredLog]?.tps_15)">
                          {{ parsedMessages[hoveredLog]?.tps_15?.toFixed(1) }}
                        </span>
                      </div>
                    </div>
                  </div>
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
    username: '系统',
    user_alias: '系统',
    message: '后端链接失败,请查看控制台日志反馈给开发者',
    attribute: '',
    send_time: Date.now() / 1000,
    players: '',
    tps: 20.0,
    tps_1: 20.0,
    tps_5: 20.0,
    tps_15: 20.0
  }
])

// 悬浮状态
const hoveredLog = ref(-1)
const showTooltip = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const isMouseOverTooltip = ref(false) // 跟踪鼠标是否在提示框上
let hideTooltipTimer = null // 隐藏提示框的定时器

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
        formatted_time: formatTime(message.send_time * 1000), // API返回的是秒级时间戳
        players: message.players || '',
        tps: message.tps || 0,
        tps_1: message.tps_1 || 0,
        tps_5: message.tps_5 || 0,
        tps_15: message.tps_15 || 0
      }
    }
    
    // 兼容旧格式或其他格式
    return {
      username: message.sender || '未知用户',
      user_alias: '',
      message: message.content || message.message || '无消息内容',
      attribute: '',
      send_time: Date.now(),
      formatted_time: formatTime(Date.now()),
      players: '',
      tps: 0,
      tps_1: 0,
      tps_5: 0,
      tps_15: 0
    }
  })
})

// 处理悬浮消息的属性列表
const hoveredMessageAttributes = computed(() => {
  if (hoveredLog.value < 0 || !parsedMessages.value[hoveredLog.value]?.attribute) {
    return []
  }
  return parsedMessages.value[hoveredLog.value].attribute
    .split('|')
    .filter(item => item && item.trim())
    .map(item => item.trim())
})

// 处理悬浮消息的玩家列表
const hoveredMessagePlayers = computed(() => {
  if (hoveredLog.value < 0 || !parsedMessages.value[hoveredLog.value]?.players) {
    return []
  }
  return parsedMessages.value[hoveredLog.value].players
    .split('|')
    .filter(item => item && item.trim())
    .map(item => item.trim())
})

// TPS状态分类函数
const getTpsClass = (tps) => {
  if (!tps) return 'tps-unknown'
  if (tps >= 19) return 'tps-excellent'
  if (tps >= 15) return 'tps-good'
  if (tps >= 10) return 'tps-warning'
  return 'tps-critical'
}

// 计算玩家数量
const getPlayerCount = (playersString) => {
  if (!playersString || playersString.trim() === '') return 0
  return playersString.split('|').filter(player => player && player.trim()).length
}

// 鼠标悬浮处理函数
const handleMessageHover = (message, index, event) => {
  // 清除隐藏定时器，确保提示框可以正常显示
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
    hideTooltipTimer = null
  }
  
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
  
  // 如果鼠标在提示框上，不更新位置，以便用户可以交互
  if (isMouseOverTooltip.value) return
  
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

// 提示框鼠标事件处理
const handleTooltipMouseEnter = () => {
  isMouseOverTooltip.value = true
  // 清除隐藏定时器，保持提示框显示
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
    hideTooltipTimer = null
  }
}

const handleTooltipMouseLeave = () => {
  isMouseOverTooltip.value = false
  // 清除之前的定时器
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
  }
  // 当鼠标离开提示框时，延迟隐藏提示框
  hideTooltipTimer = setTimeout(() => {
    if (!isMouseOverTooltip.value) {
      hoveredLog.value = -1
      showTooltip.value = false
    }
    hideTooltipTimer = null
  }, 100)
}

// 鼠标离开处理函数
const handleMessageLeave = (message, index, event) => {
  // 清除之前的定时器
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
  }
  
  // 延迟处理，给用户时间移动鼠标到提示框上
  hideTooltipTimer = setTimeout(() => {
    if (!isMouseOverTooltip.value) {
      hoveredLog.value = -1
      showTooltip.value = false
    }
    hideTooltipTimer = null
  }, 100) // 100ms延迟
  
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
:root {
  /* 深色主题（默认） */
  --bg-gradient-start: #1a1a1a;
  --bg-gradient-end: #2d2d2d;
  --border-color: #404040;
  --card-bg: rgba(45, 45, 45, 0.8);
  --card-hover-bg: rgba(60, 60, 60, 0.9);
  --card-border: #606060;
  --card-border-hover: #888;
  --text-primary: #e8e8e8;
  --text-secondary: #c0c4cc;
  --text-muted: #909399;
  --username-bg: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(64, 158, 255, 0.15));
  --username-border: rgba(64, 158, 255, 0.5);
  --username-color: #5dade2;
  --alias-bg: linear-gradient(135deg, rgba(103, 194, 58, 0.3), rgba(103, 194, 58, 0.15));
  --alias-color: #58d68d;
  --alias-border: rgba(103, 194, 58, 0.5);
  --time-bg: rgba(255, 193, 7, 0.1);
  --time-color: #f4d03f;
  --message-bg: rgba(255, 255, 255, 0.02);
  --tooltip-bg: rgba(15, 15, 15, 0.95);
  --tooltip-border: rgba(128, 128, 128, 0.4);
  --stat-bg: rgba(128, 128, 128, 0.1);
}

/* 浅色主题支持 */
@media (prefers-color-scheme: light) {
  :root {
    --bg-gradient-start: #f5f7fa;
    --bg-gradient-end: #c3cfe2;
    --border-color: #e4e7ed;
    --card-bg: rgba(255, 255, 255, 0.9);
    --card-hover-bg: rgba(248, 249, 250, 0.95);
    --card-border: #dcdfe6;
    --card-border-hover: #c0c4cc;
    --text-primary: #303133;
    --text-secondary: #606266;
    --text-muted: #909399;
    --username-bg: linear-gradient(135deg, rgba(64, 158, 255, 0.15), rgba(64, 158, 255, 0.08));
    --username-border: rgba(64, 158, 255, 0.35);
    --username-color: #2980b9;
    --alias-bg: linear-gradient(135deg, rgba(103, 194, 58, 0.15), rgba(103, 194, 58, 0.08));
    --alias-color: #27ae60;
    --alias-border: rgba(103, 194, 58, 0.35);
    --time-bg: rgba(255, 193, 7, 0.08);
    --time-color: #d68910;
    --message-bg: rgba(64, 158, 255, 0.02);
    --tooltip-bg: rgba(255, 255, 255, 0.98);
    --tooltip-border: rgba(220, 223, 230, 0.8);
    --stat-bg: rgba(64, 158, 255, 0.08);
  }
}

.log-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  border-radius: 8px;
  border: 2px solid var(--border-color);
  overflow: hidden;
  position: relative;
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
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px 20px;
  border-left: 5px solid var(--card-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(10px) saturate(120%);
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.log-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.15) 80%,
    transparent 100%);
}

.log-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 25%,
    transparent 50%,
    rgba(0, 0, 0, 0.08) 75%,
    rgba(0, 0, 0, 0.15) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: subtract;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  pointer-events: none;
  z-index: -1;
}

.log-card:hover {
  background: var(--card-hover-bg);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 12px 35px rgba(0, 0, 0, 0.25),
    0 6px 15px rgba(0, 0, 0, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.12),
    inset 0 0 30px rgba(255, 255, 255, 0.03);
  border-left-color: var(--card-border-hover);
}

.log-card:hover::after {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 75%,
    rgba(0, 0, 0, 0.2) 100%);
}

/* 卡片主要布局 */
.log-card__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.log-card__left {
  flex: 1;
  min-width: 0; /* 允许内容收缩 */
  position: relative;
  padding: 2px;
  border-radius: 8px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 50%,
    rgba(0, 0, 0, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.log-card__right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 右侧统计信息 */
.log-card__stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.stat-icon {
  font-size: 12px;
}

.stat-label {
  color: #909399;
  font-size: 9px;
  font-weight: 500;
}

.stat-value {
  font-weight: bold;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--stat-bg);
  color: var(--text-primary);
  min-width: 20px;
  text-align: center;
}

/* TPS状态颜色 - 在右侧显示时的样式 */
.stat-value.tps-excellent { 
  background: rgba(103, 194, 58, 0.2); 
  color: #67c23a; 
}
.stat-value.tps-good { 
  background: rgba(230, 162, 60, 0.2); 
  color: #e6a23c; 
}
.stat-value.tps-warning { 
  background: rgba(245, 108, 108, 0.2); 
  color: #f56c6c; 
}
.stat-value.tps-critical { 
  background: rgba(255, 71, 87, 0.2); 
  color: #ff4757; 
}
.stat-value.tps-unknown { 
  background: rgba(144, 147, 153, 0.2); 
  color: #909399; 
}

/* 卡片头部 */
.log-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

/* 卡片时间 */
.log-card__time {
  color: var(--time-color);
  background: linear-gradient(135deg, 
    rgba(255, 193, 7, 0.15) 0%,
    rgba(255, 193, 7, 0.1) 50%,
    rgba(255, 193, 7, 0.05) 100%);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.2;
  border: 1.5px solid rgba(255, 193, 7, 0.3);
  box-shadow: 
    0 2px 4px rgba(255, 193, 7, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.log-card__username {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, 
    #3b82f6 0%, 
    #6366f1 25%, 
    #8b5cf6 50%, 
    #a855f7 75%, 
    #d946ef 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 3px 8px rgba(59, 130, 246, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.log-card__username::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.log-card:hover .log-card__username::before {
  left: 100%;
}

.log-card__username:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.4),
    0 3px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.log-card__alias {
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, 
    #059669 0%, 
    #10b981 25%, 
    #34d399 50%, 
    #22d3ee 75%, 
    #06b6d4 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 2px 6px rgba(5, 150, 105, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.log-card__alias::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.25), 
    transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.log-card:hover .log-card__alias::before {
  left: 100%;
}

.log-card__alias:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 5px 15px rgba(5, 150, 105, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 卡片内容 */
.log-card__content {
  color: var(--text-primary);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 50%,
    rgba(0, 0, 0, 0.01) 100%);
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  margin-top: 6px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 1px 2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(2px);
  position: relative;
  overflow: hidden;
}

.log-card__content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
}

.log-card__message {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  word-break: break-word;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* 悬浮提示框 */
.log-card__tooltip {
  position: fixed;
  z-index: 9999;
  background: var(--tooltip-bg);
  border: 1px solid var(--tooltip-border);
  border-radius: 12px;
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  max-width: 350px;
  width: 350px;
  max-height: 250px;
  overflow-y: auto;
  pointer-events: auto;
  transform-origin: center;
  box-sizing: border-box;
  transition: left 0.1s ease-out, top 0.1s ease-out;
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
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 16px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  padding-bottom: 6px;
}

.tooltip-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-time {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: normal;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.tooltip-header strong {
  color: var(--text-secondary);
}

.header-alias {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  background: var(--alias-bg);
  color: var(--alias-color);
  border: 1px solid var(--alias-border);
}

.tooltip-body {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
}

.tooltip-body p {
  margin: 4px 0;
}

.tooltip-body strong {
  color: var(--text-secondary);
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

/* 三区块布局 */
.tooltip-sections {
  display: flex;
  gap: 0;
  margin-top: 8px;
}

.tooltip-section {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--alias-color);
  margin-bottom: 6px;
  text-align: center;
  border-bottom: 1px solid var(--alias-border);
  padding-bottom: 3px;
}

.section-content {
  font-size: 11px;
  max-height: 120px;
  overflow-y: auto;
}

.section-divider {
  width: 1px;
  background: linear-gradient(to bottom, 
    rgba(128, 128, 128, 0.2) 0%,
    rgba(128, 128, 128, 0.5) 50%,
    rgba(128, 128, 128, 0.2) 100%);
  margin: 0 8px;
}

/* 属性区块 */
.attributes-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.attribute-item {
  background: var(--alias-bg);
  border-left: 2px solid var(--alias-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  line-height: 1.3;
  color: var(--text-primary);
}

/* 玩家区块 */
.players-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 100px;
  overflow-y: auto;
}

.player-item {
  background: rgba(46, 160, 67, 0.1);
  border-left: 2px solid #2ea043;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
  line-height: 1.2;
  color: var(--text-primary);
}

/* TPS区块 */
.tps-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tps-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  background: var(--stat-bg);
  border-radius: 3px;
}

.tps-label {
  font-size: 9px;
  color: var(--text-secondary);
}

.tps-value {
  font-size: 10px;
  font-weight: bold;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* TPS状态颜色 */
.tps-excellent { color: #67c23a; }
.tps-good { color: #e6a23c; }
.tps-warning { color: #f56c6c; }
.tps-critical { color: #ff4757; }
.tps-unknown { color: #909399; }

/* 无数据提示 */
.no-data {
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
  padding: 8px 4px;
  font-size: 10px;
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



/* 自定义滚动条样式 */
.log-cards::-webkit-scrollbar {
  width: 12px;
}

.log-cards::-webkit-scrollbar-track {
  background: var(--bg-gradient-start);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.log-cards::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--card-border) 0%, var(--text-muted) 100%);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.log-cards::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--card-border-hover) 0%, var(--text-secondary) 100%);
  border-color: var(--alias-color);
}

.log-cards::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, var(--alias-color) 0%, #337ecc 100%);
}

/* Firefox滚动条样式 */
.log-cards {
  scrollbar-width: thin;
  scrollbar-color: var(--text-muted) var(--bg-gradient-start);
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
    font-size: 15px;
  }
  
  .log-card__time {
    font-size: 9px;
  }
  
  .log-card__header {
    gap: 6px;
  }
  
  .log-card__username {
    font-size: 11px;
    padding: 1px 6px;
  }
  
  .log-card__alias {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .log-card__main {
    gap: 8px;
  }
  
  .stat-item {
    font-size: 10px;
  }
  
  .stat-value {
    font-size: 10px;
    padding: 1px 3px;
  }
  
  .stat-label {
    font-size: 8px;
  }
  
  .log-cards::-webkit-scrollbar {
    width: 8px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .log-card__message {
    font-size: 15px;
  }
  
  .log-cards::-webkit-scrollbar {
    width: 10px;
  }
}

@media (min-width: 1025px) {
  .log-card__message {
    font-size: 18px;
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
    font-size: 17px;
  }
  
  .tooltip-time {
    font-size: 13px;
  }
  
  .stat-item {
    font-size: 12px;
  }
  
  .stat-value {
    font-size: 12px;
  }
  
  .stat-label {
    font-size: 10px;
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
  
  .section-title {
    font-size: 13px;
  }
  
  .section-content {
    font-size: 12px;
  }
  
  .attribute-item {
    font-size: 11px;
  }
  
  .player-item {
    font-size: 10px;
  }
  
  .tps-label {
    font-size: 10px;
  }
  
  .tps-value {
    font-size: 11px;
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
    font-size: 18px;
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
  
  .tooltip-time {
    font-size: 14px;
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
  
  .no-data {
    font-size: 11px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .section-content {
    font-size: 13px;
  }
  
  .attribute-item {
    font-size: 12px;
  }
  
  .player-item {
    font-size: 11px;
  }
  
  .tps-label {
    font-size: 11px;
  }
  
  .tps-value {
    font-size: 12px;
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
    font-size: 17px;
  }
  
  .tooltip-time {
    font-size: 13px;
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
    font-size: 18px;
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
  
  .tooltip-time {
    font-size: 14px;
  }
  
  .tooltip-body {
    font-size: 16px;
  }
  
  .header-alias {
    font-size: 14px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .section-content {
    font-size: 13px;
  }
  
  .attribute-item {
    font-size: 12px;
  }
  
  .player-item {
    font-size: 11px;
  }
  
  .tps-label {
    font-size: 11px;
  }
  
  .tps-value {
    font-size: 12px;
  }
}
</style>