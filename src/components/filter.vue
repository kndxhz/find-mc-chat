<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElAutocomplete, ElInput, ElButton, ElDatePicker } from 'element-plus'
  import 'element-plus/es/components/autocomplete/style/css'
  import 'element-plus/es/components/input/style/css'
  import 'element-plus/es/components/date-picker/style/css'
  import 'element-plus/es/components/button/style/css'
  import log from './log.vue'
  const state = ref('')
  const suggestions = [
    { value: 'Java' },
    { value: 'JavaScript' },
    { value: 'Python' },
    { value: 'C' },
    { value: 'C++' },
    { value: 'C#' },
    { value: 'Go' },
    { value: 'Rust' },
    { value: 'Ruby' },
    { value: 'PHP' },
    { value: 'Swift' },
    { value: 'Kotlin' },
    { value: 'TypeScript' },
    { value: 'Dart' },
    { value: 'Scala' },
    { value: 'Perl' }]
  const querySearch = (queryString: string, cb: (arg0: { value: string }[]) => void) => {
    const results = queryString ? suggestions.filter(s => s.value.toLowerCase().includes(queryString.toLowerCase())) : suggestions
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
  watch(filterInput, (newValue) => {
    console.log('筛选内容改变:', newValue)
  })
  const filterdate = ref<[Date, Date] | []>([])

  const defaultTime1 = new Date(2000, 1, 1, 12, 0, 0) // '12:00:00'

  watch(filterdate, (newValue) => {
    console.log('日期范围改变:', newValue)
  })

  watch(state, (newValue) => {
    console.log('ID改变:', newValue)
  })
  function on_query() {
    console.log('查询按钮点击')
  }

  // function get_id() {
  //   return state.value
  // }
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
      @click="on_query">查询</el-button>

  </div>
  <div class="log-container">
    <log />
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
