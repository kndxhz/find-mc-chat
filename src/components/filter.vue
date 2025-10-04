<script setup lang="ts">
  import { ref } from 'vue'
  import { ElAutocomplete, ElInput, ElButton, ElDatePicker } from 'element-plus'
  import 'element-plus/es/components/autocomplete/style/css'
  import 'element-plus/es/components/input/style/css'
  import 'element-plus/es/components/date-picker/style/css'
  import 'element-plus/es/components/button/style/css'
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
        id: state.value || '',
        filter: filterInput.value || '',
        start_date: '',
        end_date: ''
      }
      
      // 处理时间范围
      if (filterdate.value && filterdate.value.length === 2) {
        // 转换为秒级时间戳
        params.start_date = Math.floor(filterdate.value[0].getTime() / 1000).toString()
        params.end_date = Math.floor(filterdate.value[1].getTime() / 1000).toString()
      }
      
      console.log('查询参数:', params)
      
      // 调用API
      const response = await get_data(params) as unknown as GetDataResponse
      console.log('查询结果:', response)
      
      if (response.status === 'ok' && Array.isArray(response.chats)) {
        // 更新log组件的数据
        if (logRef.value && logRef.value.setMessages) {
          logRef.value.setMessages(response.chats)
          console.log(`成功加载 ${response.chats.length} 条聊天记录`)
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
  // 页面加载完成后自动执行查询
  import { onMounted } from 'vue'

  onMounted(() => {
    on_query()
  })
</script>
<template>
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
  <div class="log-container">
    <Log ref="logRef" />
  </div>
</template>

<style lang="css">
.filter {
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
.filter-date {
  flex: 2 1 300px;
  min-width: 220px;
  max-width: 100%;
}
.log-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
