import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Globe, 
  Database, 
  Layers, 
  Filter, 
  Search, 
  CheckSquare, 
  Square, 
  MapPin, 
  Calendar, 
  FileCode2, 
  Info,
  Compass,
  ArrowRightLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface DataPreviewItem {
  id: string;
  name: string;
  type?: string;
  format?: string;
  size?: string;
  date?: string;
  bounds?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  pairedWith?: string; // Data pair target name if available
  satellite?: string;
  resolution?: string;
}

interface DataPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  matchedFiles?: DataPreviewItem[];
  title?: string;
}

const DEFAULT_MOCK_DATA: DataPreviewItem[] = [
  {
    id: 'preview-1',
    name: 'GF2_PMS1_E114.3_N30.5_20260428_L1A00028',
    type: '高分二号 0.8m',
    format: 'GeoTIFF / COG',
    size: '1.24 GB',
    date: '2026-04-28 10:24:15',
    bounds: [30.42, 114.20, 30.70, 114.60],
    pairedWith: 'REF_DEM_WUHAN_30M_V2.tif',
    satellite: 'GF-2',
    resolution: '0.8m'
  },
  {
    id: 'preview-2',
    name: 'ZY1F_PMS_E114.1_N30.3_20260427_L1A00015',
    type: '资源一号 02E',
    format: 'GeoTIFF',
    size: '890 MB',
    date: '2026-04-27 14:12:03',
    bounds: [30.25, 114.05, 30.55, 114.45],
    pairedWith: 'REF_ORTHO_HB_2025_01.img',
    satellite: 'ZY-1F',
    resolution: '2.0m'
  },
  {
    id: 'preview-3',
    name: 'JL1_01A_E114.5_N30.6_20260426_L1A00099',
    type: '吉林一号 0.5m',
    format: 'GeoTIFF',
    size: '2.10 GB',
    date: '2026-04-26 09:45:30',
    bounds: [30.50, 114.35, 30.80, 114.75],
    pairedWith: 'REF_VECTOR_WUHAN_ADMIN.shp',
    satellite: 'JL-1',
    resolution: '0.5m'
  },
  {
    id: 'preview-4',
    name: 'SENTINEL2A_20260425_T50RVT_L2A',
    type: 'Sentinel-2 10m',
    format: 'JP2 / COG',
    size: '640 MB',
    date: '2026-04-25 11:08:42',
    bounds: [30.10, 113.90, 30.60, 114.50],
    pairedWith: 'REF_LANDUSE_WUHAN_2025.tif',
    satellite: 'Sentinel-2A',
    resolution: '10m'
  }
];

export const DataPreviewModal: React.FC<DataPreviewModalProps> = ({
  visible,
  onClose,
  matchedFiles = [],
  title = '数据预览 - 时空数据对与数字地球分布'
}) => {
  const displayItems = matchedFiles.length > 0 ? matchedFiles : DEFAULT_MOCK_DATA;

  const [selectedIds, setSelectedIds] = useState<string[]>(displayItems.map(item => item.id));
  const [activeItemId, setActiveItemId] = useState<string>(displayItems[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [view3D, setView3D] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({ lat: '30.5833', lng: '114.3055' });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<Record<string, L.Polygon>>({});

  // Reset selections when items change or modal becomes visible
  useEffect(() => {
    if (visible) {
      const items = matchedFiles.length > 0 ? matchedFiles : DEFAULT_MOCK_DATA;
      setSelectedIds(items.map(i => i.id));
      if (items.length > 0) setActiveItemId(items[0].id);
    }
  }, [visible, matchedFiles]);

  // Map Initialization
  useEffect(() => {
    if (!visible || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [30.55, 114.35],
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      // Satellite tile layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);

      // Track mouse position
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setMouseCoords({
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6)
        });
      });

      mapInstanceRef.current = map;
      renderPolygons(map);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visible]);

  // Render polygons on map according to selectedIds & activeItemId
  const renderPolygons = (map: L.Map) => {
    // Clear previous
    (Object.values(polygonLayersRef.current) as L.Polygon[]).forEach(layer => {
      if (layer) map.removeLayer(layer);
    });
    polygonLayersRef.current = {};

    const itemsToRender = displayItems.filter(item => selectedIds.includes(item.id));
    const allBounds: L.LatLngBounds = L.latLngBounds([]);

    itemsToRender.forEach((item, idx) => {
      const b = item.bounds || [
        30.3 + (idx * 0.15), 
        114.1 + (idx * 0.15), 
        30.6 + (idx * 0.15), 
        114.5 + (idx * 0.15)
      ];
      
      const polygonCoords: L.LatLngExpression[] = [
        [b[0], b[1]],
        [b[0], b[3]],
        [b[2], b[3]],
        [b[2], b[1]]
      ];

      const isActive = item.id === activeItemId;

      const polygon = L.polygon(polygonCoords, {
        color: isActive ? '#3B82F6' : '#F59E0B',
        weight: isActive ? 3 : 2,
        fillColor: isActive ? '#3B82F6' : '#F59E0B',
        fillOpacity: isActive ? 0.35 : 0.15,
        dashArray: isActive ? undefined : '5, 5'
      }).addTo(map);

      polygon.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px 4px;">
          <strong style="color: #1E40AF;">${item.name}</strong><br/>
          <span>类型: ${item.type || '卫星数据'}</span>
        </div>
      `, { sticky: true });

      polygon.on('click', () => {
        setActiveItemId(item.id);
      });

      polygonLayersRef.current[item.id] = polygon;
      allBounds.extend(L.latLngBounds([ [b[0], b[1]], [b[2], b[3]] ]));
    });

    if (allBounds.isValid() && itemsToRender.length > 0) {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 12 });
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderPolygons(mapInstanceRef.current);
    }
  }, [selectedIds, activeItemId]);

  if (!visible) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayItems.map(i => i.id));
    }
  };

  const filteredItems = displayItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[220] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="h-14 px-6 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0 shadow-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
              {title}
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                匹配记录 {displayItems.length} 组
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="h-8 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5"
          >
            <X size={16} /> 关闭预览
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Data Pair & Item List */}
        <div className="w-[420px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 shadow-2xl overflow-hidden">
          
          {/* List Header Controls */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text"
                placeholder="搜索已匹配影像、编号或卫星类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-slate-800/80 border border-slate-700/80 rounded-lg text-[12px] text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Selection Status & Toggles */}
            <div className="flex items-center justify-between text-[12px] text-slate-400 px-1">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                {selectedIds.length === displayItems.length ? (
                  <CheckSquare size={15} className="text-blue-500" />
                ) : (
                  <Square size={15} />
                )}
                <span>全选 ({selectedIds.length}/{displayItems.length})</span>
              </button>

              <span className="text-slate-500">提示: 点击列表卡片高亮地图范围</span>
            </div>
          </div>

          {/* Item Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/40">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isActive = item.id === activeItemId;

              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isActive 
                      ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10' 
                      : isSelected 
                        ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600' 
                        : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="text-slate-400 hover:text-white transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-blue-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      <h4 className="text-[13px] font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                      {item.type || '影像数据'}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400 mb-3 pl-6">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={12} className="text-slate-500 shrink-0" />
                      <span className="truncate">{item.date || '2026-04-28'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCode2 size={12} className="text-slate-500 shrink-0" />
                      <span className="truncate">{item.format || 'GeoTIFF'} ({item.size || '1.2GB'})</span>
                    </div>
                  </div>

                  {/* Data Pair Section (数据对) */}
                  <div className="pl-6 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <ArrowRightLeft size={12} className="text-amber-400 shrink-0" />
                      <span className="text-slate-500">配准参考:</span>
                      <span className="text-amber-300/90 font-mono truncate">{item.pairedWith || 'REF_WUHAN_BASE.tif'}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Database size={36} className="opacity-30" />
                <p className="text-[13px]">未找到匹配的数据记录</p>
              </div>
            )}
          </div>

          {/* Left Footer Summary */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Info size={13} className="text-blue-400" />
              数据范围框已叠加在数字地球底图
            </span>
            <span className="font-mono text-slate-500">EPSG:4326</span>
          </div>
        </div>

        {/* Right Side: Digital Earth Map Canvas */}
        <div className="flex-1 h-full relative bg-slate-950 overflow-hidden">
          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Top Controls HUD */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-1.5 text-slate-200 text-[12px] font-bold flex items-center gap-2 shadow-xl">
              <Globe size={15} className="text-blue-400" />
              <span>数字地球矢量视图</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <button 
              onClick={() => setView3D(!view3D)}
              className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all shadow-xl backdrop-blur-md flex items-center gap-1.5 ${
                view3D 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-900/90 border-slate-800/90 text-slate-300 hover:text-white'
              }`}
            >
              <Compass size={14} /> {view3D ? '3D 数字地球' : '2D 平面视图'}
            </button>
          </div>

          {/* Floating Right Map Zoom Tools */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-2xl flex flex-col gap-1">
              <button 
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="放大"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="缩小"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([30.55, 114.35], 10);
                  }
                }}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                title="复位视角"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Floating Bottom Coordinates Bar HUD */}
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-4 py-2 text-[11px] font-mono text-slate-300 flex items-center gap-5 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-blue-400" />
              <span>经度: <strong className="text-white">{mouseCoords.lng}°E</strong></span>
              <span>纬度: <strong className="text-white">{mouseCoords.lat}°N</strong></span>
            </div>
            <div className="text-slate-500">|</div>
            <div>底图: <span className="text-slate-200 font-sans">ArcGIS 卫星影像</span></div>
            <div className="text-slate-500">|</div>
            <div>已绘制范围: <span className="text-amber-400 font-bold">{selectedIds.length} 处</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
