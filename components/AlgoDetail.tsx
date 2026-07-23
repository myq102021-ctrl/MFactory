
import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Zap, 
  Layers, 
  Layout, 
  ScanLine, 
  Wheat, 
  Sprout, 
  Activity, 
  BarChart3, 
  Grid, 
  CloudSun, 
  Droplets, 
  Share2, 
  PlusCircle, 
  ArrowLeft,
  Info,
  Globe,
  FileJson,
  Upload,
  Calendar,
  FileText,
  Pipette,
  CheckCircle2,
  Cpu,
  MapPin,
  TrendingUp,
  History,
  LayoutDashboard,
  ExternalLink,
  Search,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

interface AlgoParam {
  label: string;
  enLabel: string;
  type: string;
  format: string;
  required: boolean;
  desc: string;
}

interface AlgoDetailProps {
  algo: {
    name: string;
    category: string;
    icon: React.ReactNode;
    description: string;
    params?: AlgoParam[];
  };
  onBack: () => void;
  onCreateTask?: (algoName: string) => void;
}

const MOCK_MONITOR_DATA = [
  { date: '2025-02-11', success: 120, fail: 5, total: 125 },
  { date: '2025-02-12', success: 145, fail: 8, total: 153 },
  { date: '2025-02-13', success: 132, fail: 3, total: 135 },
  { date: '2025-02-14', success: 158, fail: 12, total: 170 },
  { date: '2025-02-15', success: 180, fail: 6, total: 186 },
  { date: '2025-02-16', success: 165, fail: 4, total: 169 },
  { date: '2025-02-17', success: 190, fail: 10, total: 200 },
];

const PIE_DATA = [
  { name: '智慧农业平台', value: 45 },
  { name: '自然资源监测', value: 25 },
  { name: '城市规划系统', value: 20 },
  { name: '其他应用', value: 10 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

const LOG_DATA = [
  { time: '2025-02-17 14:23:10', requester: '智慧农业平台', status: '成功', duration: '1.2s' },
  { time: '2025-02-17 14:15:05', requester: '自然资源监测', status: '成功', duration: '0.8s' },
  { time: '2025-02-17 14:08:44', requester: '智慧农业平台', status: '失败', duration: '2.1s' },
  { time: '2025-02-17 13:55:12', requester: '城市规划系统', status: '成功', duration: '1.5s' },
  { time: '2025-02-17 13:42:33', requester: '智慧农业平台', status: '成功', duration: '1.1s' },
];

export const AlgoDetail: React.FC<AlgoDetailProps> = ({ algo, onBack, onCreateTask }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'cases' | 'monitor'>('intro');

  const renderIntro = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 算法原理 */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
          <h3 className="text-[16px] font-bold text-slate-800">算法原理</h3>
        </div>
        <div className="space-y-6">
          <p className="text-[14px] text-slate-500 leading-relaxed px-2">
            将文本检测转化为 二值分割问题 + 可微分阈值处理
          </p>
          <div className="flex justify-center px-2">
            <div className="w-full max-w-4xl p-10 bg-blue-50/30 rounded-xl border border-blue-100/20 text-[15px] text-slate-600 font-medium text-center">
              使用 CNN Backbone (如 ResNet) 提取多尺度特征: F=CNN(I)
            </div>
          </div>
        </div>
      </section>

      {/* 输入参数 */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
          <h3 className="text-[16px] font-bold text-slate-800">输入参数</h3>
        </div>
        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white mx-2">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">中文名称</th>
                <th className="px-6 py-4">英文名称</th>
                <th className="px-6 py-4">参数类型</th>
                <th className="px-6 py-4">数据格式</th>
                <th className="px-6 py-4 text-center">是否必填</th>
                <th className="px-6 py-4">描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(algo.params || [
                { label: '提交方式(get/post)', enLabel: 'method', type: 'string', format: 'string', required: true, desc: '提交方式(get/post)' },
                { label: '请求头', enLabel: 'headers', type: 'map', format: 'header', required: false, desc: '请求头' },
                { label: '提交方式(get/post)', enLabel: 'body', type: 'string', format: 'body', required: true, desc: 'body' },
              ]).map((param, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{param.label}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{param.enLabel}</td>
                  <td className="px-6 py-4 text-slate-500">{param.type}</td>
                  <td className="px-6 py-4 text-slate-500">{param.format}</td>
                  <td className="px-6 py-4 text-center">
                    <div className={`w-10 h-5 mx-auto rounded-full p-0.5 transition-colors relative ${param.required ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${param.required ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{param.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderMonitor = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: '调用总数', value: '1,248', unit: '次', trend: '+12%', icon: <Activity className="text-blue-600" /> },
          { label: 'API 成功率', value: '98.5', unit: '%', trend: '+0.5%', icon: <CheckCircle2 className="text-emerald-600" /> },
          { label: '平均响应时长', value: '1.2', unit: 's', trend: '-0.2s', icon: <Zap className="text-amber-600" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-black text-slate-800 tracking-tight">{stat.value}</span>
                <span className="text-[14px] font-bold text-slate-400">{stat.unit}</span>
              </div>
              <div className={`text-[12px] font-bold flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-slate-800">调用趋势 (REQUESTS)</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-50 text-blue-600 text-[12px] font-bold rounded-md border border-blue-100">近7天</button>
              <button className="px-3 py-1 bg-white text-slate-400 text-[12px] font-bold rounded-md border border-slate-100 hover:bg-slate-50 transition-all">近30天</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MONITOR_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="success" name="成功" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="fail" name="失败" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-800 mb-6">应用分布占比</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {PIE_DATA.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-[12px] font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-[12px] font-mono font-bold text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 调用日志 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
            <h3 className="text-[16px] font-bold text-slate-800">近期调用日志</h3>
          </div>
          <button className="text-[12px] font-bold text-blue-600 hover:underline flex items-center gap-1">
            查看全部日志 <ChevronRight size={14} />
          </button>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">调用时间</th>
                <th className="px-6 py-4">请求来源应用</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">耗时</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {LOG_DATA.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">{log.time}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{log.requester}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${log.status === '成功' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{log.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        {/* 顶部导航栏 */}
        <div className="h-14 px-8 bg-white border-b border-slate-100 flex items-center shrink-0">
          <button 
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all mr-4"
          >
            <ArrowLeft size={14} />
          </button>
          <h2 className="text-[14px] font-bold text-slate-800">算子详情</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8 space-y-6">
          {/* 算子概览卡片 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-10 flex items-start gap-10">
            <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              {React.cloneElement(algo.icon as React.ReactElement, { size: 48 })}
            </div>
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">{algo.name}</h1>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 text-[11px] font-bold rounded border border-emerald-100">
                  已推送到1个应用
                </span>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[11px] font-medium rounded border border-slate-100">基本处理</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[11px] font-medium rounded border border-slate-100">其他</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[11px] font-medium rounded border border-slate-100">其他</span>
              </div>
              <p className="text-slate-400 text-[13px] leading-relaxed">
                识别图片上的文字信息，将其提取后以文本的形态进行存储
              </p>
              <div className="grid grid-cols-4 gap-8 pt-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-300">运行环境</p>
                  <p className="text-[15px] font-bold text-slate-700">k8s/GPU</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-300">平均执行时间</p>
                  <p className="text-[15px] font-bold text-slate-700">-- 秒/帧</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-300">成功率</p>
                  <p className="text-[15px] font-bold text-slate-700">-- %</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-300">调用量</p>
                  <p className="text-[15px] font-bold text-slate-700">-- 次</p>
                </div>
              </div>
            </div>
          </div>

          {/* 详情内容卡片 */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
            {/* 标签页导航 */}
            <div className="px-8 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-10">
                {[
                  { id: 'intro', label: '算法介绍', icon: <Info size={14} /> },
                  { id: 'cases', label: '应用案例', icon: <LayoutDashboard size={14} /> },
                  { id: 'monitor', label: '调用监控', icon: <Activity size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 text-[13px] font-bold transition-all relative ${
                      activeTab === tab.id 
                      ? 'text-blue-600' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full animate-in fade-in duration-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-10">
              {activeTab === 'intro' && renderIntro()}
              {activeTab === 'monitor' && renderMonitor()}
              {activeTab === 'cases' && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 animate-in fade-in zoom-in duration-500">
                  <LayoutDashboard size={64} className="opacity-10" />
                  <p className="text-[14px] font-bold">暂无应用案例数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
