<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Wallet, ArrowDownLeft, ArrowUpRight, LockKeyhole, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import SiteFooter from '@/components/SiteFooter.vue'

interface Month { month: string; income: number; expense: number; balance: number; refund?: number; transfer?: number; netExpense?: number }
interface Entry { id: number; day: string; kind: string; amount_cents: number; counterparty: string; description: string; account: string; category: string; status: string; voided: number }
const authenticated=ref(false),loginOpen=ref(false),password=ref(''),busy=ref(false),notice=ref(''),month=ref(''),months=ref<Month[]>([]),entries=ref<Entry[]>([]),after=ref(0),more=ref(false)
let epoch=0
const money=(n:number)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(n/100)
const expense=(m:Month)=>m.netExpense??m.expense
const totals=computed(()=>months.value.reduce((a,m)=>({income:a.income+m.income,expense:a.expense+expense(m),balance:a.balance+m.balance}),{income:0,expense:0,balance:0}))
const ordered=computed(()=>[...months.value].reverse())
const ceiling=computed(()=>Math.max(1,...months.value.flatMap(m=>[m.income,Math.abs(expense(m))])))
const names:Record<string,string>={income:'收入',expense:'支出',refund:'退款',transfer:'账户划转'}
async function api(path:string,options:RequestInit={}){
 const response=await fetch('/api/ledger/'+path,{...options,credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json',...options.headers}})
 const data=await response.json()
 if(!response.ok){if(response.status===401&&path.startsWith('details')){authenticated.value=false;entries.value=[];months.value=[]}throw Error(data.error??'暂时无法连接账本')}
 return data
}
async function load(append=false){
 const version=++epoch,privateView=authenticated.value;busy.value=true;notice.value=''
 try{
  if(privateView){
   const query=new URLSearchParams({after:String(append?after.value:0)});if(month.value)query.set('month',month.value)
   const data=await api('details?'+query)
   if(version!==epoch||!authenticated.value)return
   months.value=data.months;entries.value=append?[...entries.value,...data.entries]:data.entries;after.value=data.nextAfter;more.value=data.entries.length===50
  }else{
   const data=await api('public');if(version!==epoch)return
   months.value=data.months;entries.value=[];more.value=false
   if(!data.published)notice.value='账本暂未公开'
  }
 }catch(e){if(version===epoch)notice.value=e instanceof Error?e.message:'读取失败'}finally{if(version===epoch)busy.value=false}
}
async function login(){
 busy.value=true;notice.value=''
 try{await api('login',{method:'POST',body:JSON.stringify({password:password.value})});password.value='';authenticated.value=true;loginOpen.value=false;await load()}catch(e){notice.value=e instanceof Error?e.message:'登录失败';busy.value=false}
}
async function logout(){
 epoch++;authenticated.value=false;entries.value=[];months.value=[];month.value='';password.value='';busy.value=true
 try{await api('logout',{method:'POST',body:'{}'});await load()}catch(e){notice.value=e instanceof Error?e.message:'退出失败';busy.value=false}
}
onMounted(async()=>{try{authenticated.value=(await api('session')).authenticated}catch{}await load()})
onUnmounted(()=>{epoch++;entries.value=[];months.value=[];password.value=''})
</script>

<template>
 <div class="min-h-full min-w-0 sm:h-full sm:overflow-y-auto">
  <div class="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 space-y-7">
   <header class="flex flex-wrap items-start justify-between gap-5">
    <div><p class="text-xs uppercase tracking-[.22em] text-muted-foreground mb-3">A little record of life</p><h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight"><Wallet class="size-7 text-primary"/>生活账本</h1><p class="mt-3 text-sm leading-6 text-muted-foreground">{{ authenticated?'你已登录，可以查看准确汇总和每笔交易':'分享准确的月度收支，具体账目留给自己' }}</p></div>
    <Button v-if="!authenticated" variant="outline" class="gap-2" @click="loginOpen=!loginOpen"><LockKeyhole class="size-4"/>主人登录</Button>
    <Button v-else variant="outline" class="gap-2" @click="logout"><LogOut class="size-4"/>退出登录</Button>
   </header>
   <form v-if="loginOpen&&!authenticated" class="max-w-md rounded-xl border bg-card p-5 space-y-3" @submit.prevent="login">
    <label for="ledger-password" class="text-sm font-medium">登录后查看交易明细</label>
    <div class="flex gap-2"><input id="ledger-password" v-model="password" class="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm" type="password" autocomplete="current-password" minlength="12" maxlength="200" required placeholder="账本密码"><Button :disabled="busy" type="submit">登录</Button></div>
   </form>
   <p v-if="notice" class="text-sm text-amber-700 dark:text-amber-300" role="status">{{ notice }}</p>
   <div v-if="authenticated" class="flex flex-wrap items-center gap-3 text-sm"><label class="flex items-center gap-2">月份<input v-model="month" aria-label="查看月份" type="month" class="rounded-md border bg-background px-3 py-2" @change="load()"></label><Button variant="ghost" @click="month='';load()">全部月份</Button></div>
   <template v-if="months.length">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
     <article class="rounded-xl border bg-card p-5"><p class="flex items-center gap-2 text-sm text-muted-foreground"><ArrowDownLeft class="size-4"/>收入</p><p class="mt-3 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{{ money(totals.income) }}</p></article>
     <article class="rounded-xl border bg-card p-5"><p class="flex items-center gap-2 text-sm text-muted-foreground"><ArrowUpRight class="size-4"/>支出（已抵退款）</p><p class="mt-3 text-2xl font-semibold tabular-nums text-orange-700 dark:text-orange-300">{{ money(totals.expense) }}</p></article>
     <article class="rounded-xl border bg-card p-5"><p class="text-sm text-muted-foreground">收支结余</p><p class="mt-3 text-2xl font-semibold tabular-nums">{{ money(totals.balance) }}</p></article>
    </div>
    <p class="text-xs leading-6 text-muted-foreground">范围：{{ months[0]?.month }} 至 {{ months[months.length-1]?.month }} · 仅覆盖已导入及记录的数据，收支结余不是账户余额。退款按入账月抵支出，充值、提现不算收入或消费。</p>
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="月度收支">
     <article v-for="m in ordered" :key="m.month" class="rounded-xl border bg-card p-5 space-y-4">
      <h2 class="font-semibold">{{ m.month.replace('-',' 年 ') }} 月</h2>
      <div><div class="flex justify-between text-sm"><span class="text-muted-foreground">收入</span><strong class="font-medium tabular-nums">{{ money(m.income) }}</strong></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-emerald-500/70" :style="{width:Math.max(1,m.income/ceiling*100)+'%'}"/></div></div>
      <div><div class="flex justify-between text-sm"><span class="text-muted-foreground">支出</span><strong class="font-medium tabular-nums">{{ money(expense(m)) }}</strong></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div class="h-full rounded-full bg-orange-400/70" :style="{width:Math.max(1,Math.abs(expense(m))/ceiling*100)+'%'}"/></div></div>
      <div class="flex justify-between border-t pt-3 text-sm"><span class="text-muted-foreground">结余</span><span class="tabular-nums">{{ money(m.balance) }}</span></div>
      <div v-if="authenticated" class="text-xs text-muted-foreground">退款 {{ money(m.refund??0) }} · 账户划转 {{ money(m.transfer??0) }}</div>
     </article>
    </section>
   </template>
   <p v-else-if="busy" class="py-12 text-center text-sm text-muted-foreground">正在读取账本…</p>
   <p v-else-if="!notice" class="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">这个月份还没有记录</p>
   <section v-if="authenticated" class="space-y-4">
    <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">交易明细</h2><span class="text-xs text-muted-foreground">仅自己可见</span></div>
    <div class="overflow-x-auto rounded-xl border bg-card"><table class="w-full text-left text-xs"><thead class="border-b text-muted-foreground"><tr><th class="whitespace-nowrap px-4 py-3 font-medium">日期 / 编号</th><th class="px-4 py-3 font-medium">类型</th><th class="px-4 py-3 font-medium">金额</th><th class="px-4 py-3 font-medium">对方 / 商品</th><th class="px-4 py-3 font-medium">账户 / 分类</th></tr></thead><tbody>
     <tr v-for="e in entries" :key="e.id" class="border-b last:border-0" :class="e.voided?'opacity-50 line-through':''"><td class="whitespace-nowrap px-4 py-3 tabular-nums">{{ e.day }}<span class="mt-1 block text-muted-foreground">#{{ e.id }}</span></td><td class="whitespace-nowrap px-4 py-3">{{ names[e.kind] }}</td><td class="whitespace-nowrap px-4 py-3 tabular-nums">{{ money(e.amount_cents) }}</td><td class="min-w-48 max-w-sm break-words px-4 py-3">{{ e.counterparty||'—' }}<span class="mt-1 block text-muted-foreground">{{ e.description }}</span></td><td class="min-w-36 px-4 py-3">{{ e.account||'—' }}<span class="mt-1 block text-muted-foreground">{{ e.voided?'已作废':e.category+' · '+e.status }}</span></td></tr>
    </tbody></table></div>
    <Button v-if="more" variant="outline" :disabled="busy" @click="load(true)">继续查看</Button>
   </section>
   <SiteFooter/>
  </div>
 </div>
</template>
