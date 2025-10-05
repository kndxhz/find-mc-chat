<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { ElAutocomplete, ElInput, ElButton, ElDatePicker, ElSelect, ElOption } from 'element-plus'
  import Log from './log.vue'
  import {get_id, get_data} from '../api/chat.js'
  
  // 定义API响应类型
  interface GetIdResponse {
    ids: string[]
    status: string
  }
  
  interface ChatMessage {
    username: string
    user_alias: string
    message: string
    attribute: string
    send_time: number
    players: string
    tps: number
    tps_1: number
    tps_5: number
    tps_15: number
  }
  
  interface GetDataResponse {
    chats: ChatMessage[]
    status: string
  }
  
  const state = ref('')
  const suggestions = ref<{ value: string }[]>([])
  
  // 初始化获取ID列表
  const initSuggestions = async () => {
    try {
      const response = await get_id() as unknown as GetIdResponse
      console.log('API返回数据:', response)
      if (response.status === 'ok' && Array.isArray(response.ids)) {
        suggestions.value = response.ids.map((id: string) => ({ value: id }))
        console.log('ID列表加载成功:', suggestions.value)
      } else {
        console.error('API返回数据格式不正确:', response)
      }
    } catch (error) {
      console.error('获取ID列表失败:', error)
    }
  }
  
  // 组件加载时初始化
  initSuggestions()
  
  const querySearch = (queryString: string, cb: (arg0: { value: string }[]) => void) => {
    const results = queryString 
      ? suggestions.value.filter(s => s.value.toLowerCase().includes(queryString.toLowerCase())) 
      : suggestions.value
    cb(results)
  }
  const handleSelect = (item: Record<string, any>) => {
    console.log('选中:', item['key'] || item.value)
  }

  const filterInput = ref('')
  const messageType = ref('') // 消息类型选择器
  
  // 监听state变化，当为空时清空messageType(仅针对非系统消息)
  watch(state, (newValue) => {
    if (!newValue && messageType.value !== '系统消息') {
      messageType.value = ''
    }
  })
  
  const shortcuts = [
    {
      text:'最近一分钟',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMinutes(start.getMinutes() - 1)
        return [start, end]
      },
    },
    {
      text:'最近三分钟',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMinutes(start.getMinutes() - 3)
        return [start, end]
      },
    },
    {
      text:'最近五分钟',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMinutes(start.getMinutes() - 5)
        return [start, end]
      },
    },
    {
      text: '最近一刻钟',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMinutes(start.getMinutes() - 15)
        return [start, end]
      },
    },
    {
      text: '最近半小时',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMinutes(start.getMinutes() - 30)
        return [start, end]
      },
    },
    {
      text: '最近一小时',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setHours(start.getHours() - 1)
        return [start, end]
      },
    },
    {
      text: '最近三小时',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setHours(start.getHours() - 2)
        return [start, end]
      },
    },
    {
      text: '最近六小时',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setHours(start.getHours() - 6)
        return [start, end]
      },
    },
    {
      text: '最近半天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setHours(start.getHours() - 12)
        return [start, end]
      },
    },
    {
      text: '今天',
      value: () => {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        return [start, end]
      },
    },
    {
      text: '昨天',
      value: () => {
        const start = new Date()
        start.setDate(start.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setDate(end.getDate() - 1)
        end.setHours(23, 59, 59, 999)
        return [start, end]
      },
    },
    {
      text: '最近一周',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return [start, end]
      },
    },
    {
      text: '最近一个月',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        return [start, end]
      },
    },
    {
      text: '最近三个月',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 3)
        return [start, end]
      },
    },
    {
      text: '最近半年',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 6)
        return [start, end]
      },
    },
    {
      text: '最近一年',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setFullYear(start.getFullYear() - 1)
        return [start, end]
      },
    },
  ]
  const filterdate = ref<[Date, Date] | []>([])

  const defaultTime1 = new Date(2000, 1, 1, 12, 0, 0) // '12:00:00'
  
  // log组件引用 - 定义组件实例类型
  interface LogComponentInstance {
    addMessage: (messageData: any) => void
    clearMessages: () => void
    setMessages: (messageList: any[]) => void
    messages: any
  }
  
  const logRef = ref<LogComponentInstance>()
  const isLoading = ref(false)
  
  // 查询按钮点击处理
  async function on_query() {
    try {
      isLoading.value = true
      
      // 构建查询参数
      const params: Record<string, string> = {
        id: '',
        filter: '',
        start_date: '',
        end_date: ''
      }
      
      // 根据消息类型设置查询参数
      if (messageType.value === '系统消息') {
        // 系统消息: id设为"系统", filter设为玩家ID(可以为空)
        params.id = '系统'
        params.filter = state.value || ''
      } else {
        // 其他情况: 正常设置
        params.id = state.value || ''
        params.filter = filterInput.value || ''
      }
      
      // 处理时间范围
      if (filterdate.value && filterdate.value.length === 2) {
        // 转换为秒级时间戳
        // 后端数据时间慢了16小时,说明后端存储的时间需要加16小时才是实际时间
        // 所以查询时需要减去16小时的偏移
        
        params.start_date = (Math.floor(filterdate.value[0].getTime() / 1000) ).toString()
        params.end_date = (Math.floor(filterdate.value[1].getTime() / 1000) ).toString()
      }
      
      console.log('查询参数:', params)
      
      // 调用API
      const response = await get_data(params) as unknown as GetDataResponse
      console.log('查询结果:', response)
      
      if (response.status === 'ok' && Array.isArray(response.chats)) {
        let filteredChats = response.chats
        
        // 根据消息类型进行前端过滤
        if (messageType.value && messageType.value !== '系统消息') {
          if (messageType.value === '普通消息') {
            // 筛选没有属性的消息
            if (state.value) {
              // 有ID: 筛选该玩家的普通消息
              filteredChats = filteredChats.filter(chat => 
                !chat.attribute && 
                (chat.username === state.value || chat.user_alias === state.value)
              )
            } else {
              // 无ID: 筛选所有普通消息
              filteredChats = filteredChats.filter(chat => !chat.attribute)
            }
          } else if (messageType.value === '展示消息') {
            // 筛选有属性的消息
            if (state.value) {
              // 有ID: 筛选该玩家的展示消息
              filteredChats = filteredChats.filter(chat => 
                chat.attribute && 
                (chat.username === state.value || chat.user_alias === state.value)
              )
            } else {
              // 无ID: 筛选所有展示消息
              filteredChats = filteredChats.filter(chat => chat.attribute)
            }
          }
        } else if (state.value && !messageType.value) {
          // 有ID但无消息类型: 显示该玩家的所有消息(普通+系统+展示)
          filteredChats = filteredChats.filter(chat => 
            // 普通消息: 没有属性的该玩家消息
            (!chat.attribute && (chat.username === state.value || chat.user_alias === state.value)) ||
            // 系统消息: 系统发送且内容包含ID
            (chat.username === '系统' && chat.message.includes(state.value)) ||
            // 展示消息: 有属性的该玩家消息
            (chat.attribute && (chat.username === state.value || chat.user_alias === state.value))
          )
        }
        // 如果既无ID又无消息类型，或者是系统消息，则不过滤(显示所有查询结果)
        
        // 更新log组件的数据
        if (logRef.value && logRef.value.setMessages) {
          logRef.value.setMessages(filteredChats)
          console.log(`成功加载 ${filteredChats.length} 条聊天记录`)
        } else {
          console.error('Log组件引用未就绪或方法不存在')
        }
      } else {
        console.error('查询返回数据格式不正确:', response)
      }
    } catch (error) {
      console.error('查询失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  onMounted(() => {
    on_query()
  })
  const options = [
  {
    value: '普通消息',
    label: '普通消息',
  },
  {
    value: '系统消息',
    label: '系统消息',
  },
  {
    value: '展示消息',
    label: '展示消息',
  }
]
</script>
<template>
  <div class="page-container">
    <div class="filter">
      <el-autocomplete
        class="ID-input"
        v-model="state"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        placeholder="请输入ID（空则全部查询）"
        @select="handleSelect"
        clearable
      />
      <el-select
        class="message-type-select"
        v-model="messageType"
        placeholder="消息类型"
        clearable
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        class="filter-input"
        v-model="filterInput"
        placeholder="筛选内容(支持正则，空则全部查询)"
        clearable
      />
      <el-date-picker
        class="filter-date"
        v-model="filterdate"
        type="datetimerange"
        start-placeholder="开始日期（空则全部查询）"
        end-placeholder="结束日期（空则全部查询）"
        :default-time="defaultTime1"
        :shortcuts="shortcuts"
      />
      <el-button
        class="query-button"
        @click="on_query"
        :loading="isLoading"
        type="primary">查询</el-button>
    </div>
    
    <div class="log-wrapper">
      <Log ref="logRef" />
    </div>
  </div>
</template>

<style lang="css">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.ID-input,
.filter-input {
  flex: 1 1 200px;
  min-width: 180px;
  max-width: 100%;
}

.message-type-select {
  flex: 0 0 auto;
  width: 110px;
}

.filter-date {
  flex: 2 1 300px;
  min-width: 220px;
  max-width: 100%;
}

.log-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
