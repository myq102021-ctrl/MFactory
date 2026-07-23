import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Square, 
  Hexagon, 
  PenTool, 
  Circle, 
  Calendar, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Plus, 
  Minus, 
  Layers, 
  MapPin, 
  Filter, 
  CheckCircle2, 
  Database,
  BarChart2,
  Globe,
  Sliders,
  AlignLeft,
  Trash2,
  Code,
  ArrowLeft,
  FileText,
  Heart
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PlatformResultItem {
  id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  date: string;
  thumbnail: string;
}

interface DataPlatformSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedPath: string, matchedFiles?: PlatformResultItem[]) => void;
}

const MOCK_PLATFORM_RESULTS: PlatformResultItem[] = [
  {
    id: 'res-1',
    name: '矢量边界_001',
    type: 'shp',
    format: 'shp',
    size: '642 KB',
    date: '2026-04-28',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-2',
    name: 'ZY1F_PMS',
    type: '影像',
    format: 'geojson',
    size: '79 KB',
    date: '2026-04-27',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-3',
    name: '城市精细模型_003',
    type: '三维模型',
    format: 'tif',
    size: '1.12 GB',
    date: '2026-04-26',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-4',
    name: '业务表格_人口统计_004',
    type: '业务表',
    format: 'geotiff',
    size: '1.0 MB',
    date: '2026-04-25',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-5',
    name: '无人机巡检_005',
    type: '视频',
    format: 'cogtif',
    size: '103 KB',
    date: '2026-04-24',
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-6',
    name: '矢量边界_006',
    type: 'shp',
    format: 'kml',
    size: '1.3 MB',
    date: '2026-04-23',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-7',
    name: 'GF5A_WTI',
    type: '影像',
    format: 'kmz',
    size: '1.4 MB',
    date: '2026-04-22',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-8',
    name: '城市精细模型_008',
    type: '三维模型',
    format: 'shp',
    size: '126 KB',
    date: '2026-04-21',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?w=120&auto=format&fit=crop&q=60'
  },
  {
    id: 'res-9',
    name: '业务表格_人口统计_009',
    type: '业务表',
    format: 'geojson',
    size: '88 KB',
    date: '2026-04-20',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=120&auto=format&fit=crop&q=60'
  }
];

export const DataPlatformSearchModal: React.FC<DataPlatformSearchModalProps> = ({
  visible,
  onClose,
  onConfirm
}) => {
  // Modal View Mode: 'search' (Figure 1) or 'results' (Figure 2)
  const [viewMode, setViewMode] = useState<'search' | 'results'>('search');

  // Search Form State
  const [keyword, setKeyword] = useState('');
  const [areaTab, setAreaTab] = useState<'draw' | 'admin' | 'latlon' | 'upload'>('draw');
  const [selectedTool, setSelectedTool] = useState<'rect' | 'polygon' | 'line' | 'circle'>('rect');
  const [timePreset, setTimePreset] = useState<'week' | 'month' | '3months' | 'halfyear' | 'year'>('month');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-07-23');
  const [whereClause, setWhereClause] = useState("column_name = 'value' AND status = 1");
  const [isMoreConditionsOpen, setIsMoreConditionsOpen] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [view3D, setView3D] = useState(true);

  // Results Selection State (Default 3 items checked matching Figure 2)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(['res-2', 'res-5', 'res-6']);

  // Map reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!visible) {
      setViewMode('search');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM layout has rendered
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!mapContainerRef.current) return;

      // Center on Wuhan/Hubei coordinates [30.5928, 114.3055], zoom level 7
      const map = L.map(mapContainerRef.current, {
        center: [30.5928, 114.3055],
        zoom: 7,
        zoomControl: false,
        attributionControl: false
      });

      // Esri World Imagery Satellite Tiles
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        subdomains: ['server', 'services']
      }).addTo(map);

      // Add orange polygonal satellite footprints matching Figure 2
      const polygonsData = [
        // Footprint 1: Wuhan-Xiaogan region
        [
          [31.2, 113.5],
          [31.5, 114.8],
          [30.4, 115.2],
          [30.1, 113.9]
        ],
        // Footprint 2: Hubei-Huanggang region
        [
          [31.0, 114.2],
          [31.3, 115.6],
          [30.1, 115.8],
          [29.8, 114.4]
        ],
        // Footprint 3: Wuhan-Xiantao region
        [
          [30.8, 113.2],
          [31.0, 114.5],
          [29.9, 114.7],
          [29.7, 113.4]
        ]
      ];

      polygonsData.forEach(coords => {
        L.polygon(coords as [number, number][], {
          color: '#f59e0b', // Bright orange border
          weight: 2,
          fillColor: '#fbbf24', // Yellow-orange fill
          fillOpacity: 0.25
        }).addTo(map);
      });

      // Add blue administrative boundary outline for Wuhan/Hubei
      const wuhanBorderCoords: [number, number][] = [
        [31.0, 114.1],
        [30.9, 114.4],
        [30.8, 114.6],
        [30.5, 114.7],
        [30.3, 114.5],
        [30.2, 114.2],
        [30.3, 113.9],
        [30.6, 113.8],
        [30.8, 114.0]
      ];

      L.polygon(wuhanBorderCoords, {
        color: '#3b82f6', // Light blue outline
        weight: 2.5,
        fillColor: '#60a5fa',
        fillOpacity: 0.1
      }).addTo(map);

      mapInstanceRef.current = map;
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visible, viewMode]);

  if (!visible) return null;

  // Click 检索 in Figure 1 -> enter Figure 2 (viewMode: 'results')
  const handleStartSearch = () => {
    setViewMode('results');
  };

  const handleReset = () => {
    setKeyword('');
    setSearchLocation('');
    setTimePreset('month');
    setWhereClause("column_name = 'value' AND status = 1");
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmResults = () => {
    const selectedItems = MOCK_PLATFORM_RESULTS.filter(res => selectedItemIds.includes(res.id));
    const dataPath = `[数管平台] 武汉市时空检索数据集_${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
    onConfirm(dataPath, selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Globe size={18} />
          </div>
          <span className="text-[16px] font-bold text-slate-800 tracking-tight">数管平台时空数据检索</span>
          <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">数据检索服务 v2.0</span>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Panel - Figure 1 or Figure 2 */}
        {viewMode === 'search' ? (
          /* Figure 1: 时空综合检索 */
          <div className="w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-20 overflow-hidden">
            {/* Panel Title */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-600" />
                <h3 className="text-[15px] font-bold text-slate-800">时空综合检索</h3>
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-50">
                <Layers size={16} />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* Step 1: 全局搜索匹配 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
                    <span className="text-[14px] font-bold text-slate-800">全局搜索匹配</span>
                  </div>
                  <span className="text-[12px] text-slate-400">全文检索</span>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="支持所有入库数据全文搜索匹配"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 bg-slate-50/60 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Step 2: 查询区域选择 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                  <span className="text-[14px] font-bold text-slate-800">查询区域选择</span>
                </div>

                {/* Area Sub-Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/70 rounded-lg text-[12px] font-medium text-slate-600">
                  <button 
                    onClick={() => setAreaTab('draw')}
                    className={`py-1.5 rounded-md text-center transition-all ${areaTab === 'draw' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    绘制范围
                  </button>
                  <button 
                    onClick={() => setAreaTab('admin')}
                    className={`py-1.5 rounded-md text-center transition-all ${areaTab === 'admin' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    行政区域
                  </button>
                  <button 
                    onClick={() => setAreaTab('latlon')}
                    className={`py-1.5 rounded-md text-center transition-all ${areaTab === 'latlon' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    经纬度
                  </button>
                  <button 
                    onClick={() => setAreaTab('upload')}
                    className={`py-1.5 rounded-md text-center transition-all ${areaTab === 'upload' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'hover:text-slate-900'}`}
                  >
                    上传矢量
                  </button>
                </div>

                {/* 绘制范围 Tool Buttons */}
                {areaTab === 'draw' && (
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    <button 
                      onClick={() => setSelectedTool('rect')}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1.5 ${
                        selectedTool === 'rect' 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Square size={18} />
                      <span className="text-[12px] font-medium">矩形</span>
                    </button>

                    <button 
                      onClick={() => setSelectedTool('polygon')}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1.5 ${
                        selectedTool === 'polygon' 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Hexagon size={18} />
                      <span className="text-[12px] font-medium">多边形</span>
                    </button>

                    <button 
                      onClick={() => setSelectedTool('line')}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1.5 ${
                        selectedTool === 'line' 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <PenTool size={18} />
                      <span className="text-[12px] font-medium">绘制线</span>
                    </button>

                    <button 
                      onClick={() => setSelectedTool('circle')}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1.5 ${
                        selectedTool === 'circle' 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Circle size={18} />
                      <span className="text-[12px] font-medium">绘制圆</span>
                    </button>
                  </div>
                )}

                {areaTab === 'admin' && (
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <select className="h-9 px-3 border border-slate-200 rounded-lg bg-white">
                      <option>湖北省</option>
                    </select>
                    <select className="h-9 px-3 border border-slate-200 rounded-lg bg-white">
                      <option>武汉市</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Step 3: 查询时间 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">3</span>
                  <span className="text-[14px] font-bold text-slate-800">查询时间</span>
                </div>

                {/* Time Presets */}
                <div className="flex items-center gap-1.5 text-[12px]">
                  {[
                    { id: 'week', label: '近一周' },
                    { id: 'month', label: '近一月' },
                    { id: '3months', label: '近三月' },
                    { id: 'halfyear', label: '近半年' },
                    { id: 'year', label: '近一年' }
                  ].map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setTimePreset(p.id as any)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        timePreset === p.id 
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' 
                          : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">-</span>
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Accordion: 更多条件 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setIsMoreConditionsOpen(!isMoreConditionsOpen)}
                  className="w-full px-4 py-3 bg-slate-50/80 flex items-center justify-between text-[13px] font-bold text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <span>更多条件</span>
                  {isMoreConditionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isMoreConditionsOpen && (
                  <div className="p-3.5 space-y-3 bg-white border-t border-slate-100">
                    <div className="bg-blue-50/40 rounded-xl p-3 border border-blue-100/60 space-y-2">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-blue-900">WHERE条件编辑器</span>
                        <div className="flex items-center gap-3">
                          <button className="text-blue-600 hover:underline">格式化</button>
                          <button onClick={() => setWhereClause('')} className="text-slate-400 hover:text-slate-600">清空</button>
                        </div>
                      </div>
                      <textarea 
                        rows={3}
                        value={whereClause}
                        onChange={(e) => setWhereClause(e.target.value)}
                        placeholder="请输入WHERE条件，例如：column_name = 'value' AND status = 1"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 font-mono focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
              <button 
                onClick={handleReset}
                className="flex-1 h-10 border border-slate-200 text-slate-700 rounded-xl font-bold text-[13px] hover:bg-slate-50 transition-all active:scale-95"
              >
                重置
              </button>
              <button 
                onClick={handleStartSearch}
                className="flex-1 h-10 bg-blue-600 text-white rounded-xl font-bold text-[13px] hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Search size={15} /> 检索
              </button>
            </div>
          </div>
        ) : (
          /* Figure 2: 查询结果 */
          <div className="w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode('search')}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                  title="返回检索"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-[15px] font-bold text-slate-800">查询结果</h3>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1.5 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="导出"><FileText size={16} /></button>
                <button className="p-1.5 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="收藏"><Heart size={16} /></button>
                <button className="p-1.5 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="代码"><Code size={16} /></button>
              </div>
            </div>

            {/* Results Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {MOCK_PLATFORM_RESULTS.map((item) => {
                const isChecked = selectedItemIds.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked 
                        ? 'border-blue-400 bg-blue-50/30 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded cursor-pointer shrink-0"
                    />
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200/60 shadow-xs mt-0.5"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[13px] font-bold text-slate-800 truncate leading-snug">{item.name}</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-500 leading-tight">
                        <span>类型: {item.type}</span>
                        <span>格式: {item.format}</span>
                        <span>数据量: {item.size}</span>
                        <span>采集时间: {item.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer: Pagination info + 确定 / 取消 buttons */}
            <div className="p-3.5 bg-white border-t border-slate-100 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                <span>已选 <strong className="text-blue-600 font-bold">{selectedItemIds.length}</strong> 景 / 共 50 景</span>
                <div className="flex items-center gap-2">
                  <span>每页 50 条</span>
                  <span>第 1 页 共 1 页</span>
                </div>
              </div>

              {/* Action Buttons: 确定 & 取消 */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button 
                  onClick={handleConfirmResults}
                  className="h-9 bg-blue-600 text-white rounded-lg font-bold text-[13px] hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  确定
                </button>
                <button 
                  onClick={onClose}
                  className="h-9 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[13px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Map Canvas Area */}
        <div className="flex-1 h-full relative bg-slate-950 overflow-hidden">
          
          {/* Top Search Location Bar on Map */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-80 shadow-2xl">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索位置"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-10 pl-4 pr-10 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl text-[13px] text-slate-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Bottom Right Floating Map Tool Badges */}
          <div className="absolute right-5 bottom-12 z-20 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-slate-200/60 flex flex-col gap-1 text-slate-700">
              <button 
                onClick={() => setView3D(!view3D)} 
                className={`p-2 rounded-lg text-[12px] font-black transition-colors ${view3D ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-100'}`}
                title="3D视图"
              >
                3D
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="重置视角">
                <RotateCcw size={16} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="全屏">
                <Maximize2 size={16} />
              </button>
              <div className="w-full h-[1px] bg-slate-200 my-0.5" />
              <button onClick={() => mapInstanceRef.current?.zoomIn()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="放大">
                <Plus size={16} />
              </button>
              <button onClick={() => mapInstanceRef.current?.zoomOut()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="缩小">
                <Minus size={16} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="图层切换">
                <Layers size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Map Status Bar matching Figure 2 */}
          <div className="absolute bottom-0 inset-x-0 h-8 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 px-5 flex items-center justify-between text-[11px] text-slate-300 z-20">
            <div className="flex items-center gap-4">
              <span>层级: <strong className="text-white">7</strong></span>
              <span>经度: <strong className="text-white">114.899287°E</strong></span>
              <span>纬度: <strong className="text-white">30.666509°N</strong></span>
              <span>高程: <strong className="text-white">24.5 m</strong></span>
              <span>维度: <strong className="text-white">3D</strong></span>
              <span>日期: <strong className="text-white">07/23 09:19</strong></span>
              <span>底层: <strong className="text-white">卫星影像</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-2.5 py-0.5 bg-slate-100/90 text-slate-800 rounded text-[11px] font-bold hover:bg-white transition-colors">
                图表视图
              </button>
              <span className="text-slate-400 font-mono">EPSG:4326</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

