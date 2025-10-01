<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElAutocomplete, ElInput } from 'element-plus'
  import 'element-plus/es/components/autocomplete/style/css'
  import 'element-plus/es/components/input/style/css'
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

  watch(filterInput, (newValue) => {
    console.log('筛选内容改变:', newValue)
  })
</script>
<template>
  <div class="filter">
    <el-autocomplete
      class="ID-input"
      v-model="state"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="false"
      placeholder="请输入ID"
      @select="handleSelect"
    ></el-autocomplete>
    <el-input
      class="filter-input"
      v-model="filterInput"
      placeholder="筛选内容(支持正则)"
      clearable
    />
  </div>
</template>

<style lang="css">
  .filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: row;
}
.ID-input {
  width: 300px;
  max-width: 300px;
}
.filter-input {
  width: 300px;
  max-width: 300px;
}

</style>
