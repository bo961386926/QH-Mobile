// 告警列表主模块
const AlertListModule = (function() {
    // 模块状态
    let moduleState = {
        initialized: false,
        currentTab: 'unhandled',
        isFilterPanelOpen: false,
        isSortDropdownOpen: false,
        isAreaPanelOpen: false,
        selectedArea: 'all' // 添加选中区域状态
    };

    // 区域层级数据（示例）
    const areaHierarchy = {
        lanxi: [
            { code: 'area1', name: '一片区' },
            { code: 'area2', name: '二片区' },
            { code: 'area3', name: '三片区' }
        ],
        // 添加更多区域数据以增强功能
        area1: [
            { code: 'site1', name: '一号泵站' },
            { code: 'site2', name: '二号泵站' }
        ],
        area2: [
            { code: 'site3', name: '三号泵站' },
            { code: 'site4', name: '四号泵站' }
        ],
        area3: [
            { code: 'site5', name: '五号泵站' },
            { code: 'site6', name: '六号泵站' }
        ]
    };

    // 初始化模块
    function initialize() {
        try {
            if (moduleState.initialized) {
                console.warn('告警列表模块已经初始化');
                return;
            }

            // 验证依赖模块
            if (typeof AlertDataManager === 'undefined' || 
                typeof AlertFilterManager === 'undefined' || 
                typeof AlertRenderer === 'undefined') {
                throw new Error('依赖模块未加载，请确保所有模块文件已正确引入');
            }

            // 初始化事件监听器
            initializeEventListeners();

            // 初始化页面状态
            initializePageState();

            // 渲染初始数据
            refreshAlertList();

            moduleState.initialized = true;
            console.log('告警列表模块初始化完成');
        } catch (error) {
            console.error('初始化告警列表模块时出错:', error);
            AlertRenderer.showToast('初始化失败: ' + error.message, 'error');
        }
    }

    // 设置遮罩与滚动锁定
    function setOverlayVisible(visible) {
        const overlay = document.getElementById('overlay');
        const body = document.body;
        if (overlay) overlay.style.display = visible ? 'block' : 'none';
        if (body) body.classList.toggle('no-scroll', !!visible);
    }

    // 动态渲染区域列
    function populateAreaChildren(rootCode) {
        const column = document.getElementById('areaColumn1');
        if (!column) return;
        const children = areaHierarchy[rootCode] || [];
        column.innerHTML = children.map(child => (
            `<div class="area-option" data-value="${child.code}">
                <span class="area-option-text">${child.name}</span>
                ${areaHierarchy[child.code] && areaHierarchy[child.code].length > 0 ? '<i class="bi bi-chevron-right area-option-arrow"></i>' : ''}
            </div>`
        )).join('');

        column.querySelectorAll('.area-option').forEach(opt => {
            opt.addEventListener('click', function() {
                const code = this.getAttribute('data-value');
                // 如果有子区域，显示子区域
                if (areaHierarchy[code] && areaHierarchy[code].length > 0) {
                    populateAreaChildren(code);
                } else {
                    // 否则选择该区域
                    AlertListModule.selectArea(this, code);
                    AlertListModule.closeAreaSelector();
                }
            });
        });
    }
    
    // 区域选择面板中的区域填充函数
    function populateAreaChildren(rootCode) {
        const column = document.getElementById('areaColumn1');
        if (!column) return;
        const children = areaHierarchy[rootCode] || [];
        column.innerHTML = children.map(child => (
            `<div class="area-option" data-value="${child.code}">
                <span class="area-option-text">${child.name}</span>
                ${areaHierarchy[child.code] && areaHierarchy[child.code].length > 0 ? '<i class="bi bi-chevron-right area-option-arrow"></i>' : ''}
            </div>`
        )).join('');

        column.querySelectorAll('.area-option').forEach(opt => {
            opt.addEventListener('click', function() {
                const code = this.getAttribute('data-value');
                // 如果有子区域，显示子区域
                if (areaHierarchy[code] && areaHierarchy[code].length > 0) {
                    populateAreaChildren(code);
                } else {
                    // 否则选择该区域
                    AlertListModule.selectArea(this, code);
                    AlertListModule.closeAreaSelector();
                }
            });
        });
    }

    // 初始化事件监听器
    function initializeEventListeners() {
        try {
            // 搜索框防抖处理
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                const debouncedSearch = AlertFilterManager.debounce(searchAlerts, 300);
                searchInput.addEventListener('input', debouncedSearch);
            }

            // 标签页切换
            const tabButtons = document.querySelectorAll('[data-tab]');
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    switchTab(this.dataset.tab);
                });
            });

            // 筛选面板控制
            const filterToggle = document.getElementById('filterToggle');
            if (filterToggle) {
                filterToggle.addEventListener('click', toggleFilterPanel);
            }

            // 排序下拉菜单
            const sortToggle = document.getElementById('sortToggle');
            if (sortToggle) {
                sortToggle.addEventListener('click', toggleSortDropdown);
            }

            // 区域选择面板
            const areaToggle = document.getElementById('areaToggle');
            if (areaToggle) {
                areaToggle.addEventListener('click', toggleAreaPanel);
            }

            // 点击外部关闭下拉菜单和面板
            document.addEventListener('click', function(event) {
                closeDropdowns(event);
            });

            // 窗口大小变化时调整布局
            window.addEventListener('resize', handleResize);
            // 监听滚动事件，确保下拉菜单位置正确
            window.addEventListener('scroll', handleScroll);

            // ESC 键关闭所有面板
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeAllPanels();
                }
            });

            console.log('事件监听器初始化完成');
        } catch (error) {
            console.error('初始化事件监听器时出错:', error);
        }
    }

    // 初始化页面状态
    function initializePageState() {
        try {
            // 设置初始标签页
            const initialTab = moduleState.currentTab;
            const tabButton = document.querySelector(`[data-tab="${initialTab}"]`);
            if (tabButton) {
                tabButton.classList.add('active');
            }

            // 更新标签页计数
            const counts = AlertDataManager.getAlertCounts();
            AlertRenderer.renderTabCounts(counts);

            // 设置响应式边距
            // 使用 setTimeout 确保在 DOM 完全渲染后再调整边距
            setTimeout(() => {
                adjustContentMargin();
                // 初始化时也更新一下下拉菜单的位置
                updateDropdownPositions();
            }, 0);

            console.log('页面状态初始化完成');
        } catch (error) {
            console.error('初始化页面状态时出错:', error);
        }
    }

    // 调整内容边距（响应式布局）
    function adjustContentMargin() {
        try {
            const header = document.querySelector('.alert-header-section');
            const content = document.querySelector('.main-content');
            
            if (header && content) {
                const headerHeight = header.offsetHeight;
                content.style.marginTop = headerHeight + 'px';
                
                // 调试信息
                console.log('调整内容边距:', headerHeight + 'px');
            } else {
                console.warn('无法找到头部或内容元素');
            }
        } catch (error) {
            console.error('调整内容边距时出错:', error);
        }
    }

    // 处理窗口大小变化
    function handleResize() {
        adjustContentMargin();
        updateDropdownPositions();
        
        // 在移动端关闭所有下拉菜单和面板
        if (window.innerWidth < 768) {
            closeAllPanels();
        }
    }

    // 处理滚动事件
    function handleScroll() {
        updateDropdownPositions();
    }

    // 更新下拉菜单位置
    function updateDropdownPositions() {
        try {
            const header = document.querySelector('.alert-header-section');
            if (!header) return;

            const headerBottom = header.getBoundingClientRect().bottom;
            
            // 更新排序下拉菜单位置
            const sortDropdown = document.getElementById('sortDropdown');
            if (sortDropdown) {
                sortDropdown.style.top = headerBottom + 'px';
            }
            
            // 更新筛选面板位置
            const filterPanel = document.getElementById('filter-panel');
            if (filterPanel) {
                filterPanel.style.top = headerBottom + 'px';
            }
            
            // 更新区域选择面板位置
            const areaSelector = document.getElementById('areaSelector');
            if (areaSelector) {
                areaSelector.style.top = headerBottom + 'px';
            }
        } catch (error) {
            console.error('更新下拉菜单位置时出错:', error);
        }
    }

    // 关闭所有面板
    function closeAllPanels() {
        moduleState.isFilterPanelOpen = false;
        moduleState.isSortDropdownOpen = false;
        moduleState.isAreaPanelOpen = false;
        
        const panels = document.querySelectorAll('.filter-panel, .sort-dropdown, .area-panel');
        panels.forEach(panel => {
            panel.classList.remove('show');
        });

        // 同步实际 DOM
        const filterPanel = document.getElementById('filter-panel');
        if (filterPanel) filterPanel.classList.remove('active');
        const sortDropdown = document.getElementById('sortDropdown');
        if (sortDropdown) sortDropdown.style.display = 'none';
        const areaSelector = document.getElementById('areaSelector');
        if (areaSelector) areaSelector.style.display = 'none';

        setOverlayVisible(false);
    }

    // 刷新告警列表
    function refreshAlertList() {
        try {
            const allAlerts = AlertDataManager.getAllAlerts();
            const filteredAlerts = AlertFilterManager.filterAndSortAlerts(allAlerts);
            
            AlertRenderer.renderAlertList(filteredAlerts);
            
            // 更新标签页计数
            const counts = AlertDataManager.getAlertCounts();
            AlertRenderer.renderTabCounts(counts);
            
            console.log('告警列表刷新完成，显示', filteredAlerts.length, '条记录');
        } catch (error) {
            console.error('刷新告警列表时出错:', error);
            AlertRenderer.showToast('刷新告警列表失败', 'error');
        }
    }

    // 搜索告警
    function searchAlerts() {
        try {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) return;
            
            const searchText = searchInput.value.trim();
            AlertFilterManager.updateFilterState({ searchText });
            refreshAlertList();
        } catch (error) {
            console.error('搜索告警时出错:', error);
        }
    }

    // 错误处理函数
    function handleError(error, context = '') {
        console.error(`[AlertListModule Error] ${context}:`, error);
        
        // 显示用户友好的错误信息
        if (typeof AlertRenderer !== 'undefined' && AlertRenderer.showToast) {
            AlertRenderer.showToast(`操作失败: ${error.message || '未知错误'}`, 'error');
        }
        
        return false;
    }

    // 安全的初始化
    function safeInitialize() {
        try {
            if (moduleState.initialized) {
                console.warn('告警列表模块已经初始化');
                return true;
            }

            // 验证依赖模块
            if (typeof AlertDataManager === 'undefined') {
                throw new Error('AlertDataManager 模块未加载');
            }
            if (typeof AlertFilterManager === 'undefined') {
                throw new Error('AlertFilterManager 模块未加载');
            }
            if (typeof AlertRenderer === 'undefined') {
                throw new Error('AlertRenderer 模块未加载');
            }

            // 验证必要的DOM元素
            const requiredElements = ['searchInput', 'filterToggle', 'sortToggle', 'areaToggle'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                throw new Error(`缺少必要的DOM元素: ${missingElements.join(', ')}`);
            }

            // 初始化事件监听器
            initializeEventListeners();

            // 初始化页面状态
            initializePageState();

            // 渲染初始数据
            refreshAlertList();

            moduleState.initialized = true;
            console.log('告警列表模块初始化完成');
            return true;
        } catch (error) {
            return handleError(error, '初始化模块');
        }
    }

    // 安全的刷新告警列表
    function safeRefreshAlertList() {
        try {
            const allAlerts = AlertDataManager.safeGetAllAlerts();
            if (!allAlerts) {
                throw new Error('获取告警数据失败');
            }
            
            const filteredAlerts = AlertFilterManager.safeFilterAndSortAlerts(allAlerts);
            if (!filteredAlerts) {
                throw new Error('筛选排序告警数据失败');
            }
            
            AlertRenderer.renderAlertList(filteredAlerts);
            
            // 更新标签页计数
            const counts = AlertDataManager.safeGetAlertCounts();
            if (counts) {
                AlertRenderer.renderTabCounts(counts);
            }
            
            console.log('告警列表刷新完成，显示', filteredAlerts.length, '条记录');
            return true;
        } catch (error) {
            return handleError(error, '刷新告警列表');
        }
    }

    // 切换标签页
    function switchTab(tab) {
        try {
            // 验证标签参数
            const validTabs = ['all', 'unhandled', 'processing', 'handled'];
            if (!validTabs.includes(tab)) {
                throw new Error(`无效的标签页: ${tab}`);
            }
            
            // 更新按钮状态
            const tabButtons = document.querySelectorAll('[data-tab]');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`[data-tab="${tab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
            
            // 更新筛选状态
            AlertFilterManager.updateFilterState({ 
                status: tab === 'all' ? 'all' : tab 
            });
            
            moduleState.currentTab = tab;
            refreshAlertList();
            
            console.log('切换到标签页:', tab);
        } catch (error) {
            console.error('切换标签页时出错:', error);
            AlertRenderer.showToast('切换标签页失败', 'error');
        }
    }

    // 切换筛选面板
    function toggleFilterPanel(event) {
        try {
            if (event) event.stopPropagation();

            const filterPanel = document.getElementById('filter-panel');
            if (!filterPanel) return;
            
            moduleState.isFilterPanelOpen = !moduleState.isFilterPanelOpen;
            
            if (moduleState.isFilterPanelOpen) {
                filterPanel.classList.add('active');
                filterPanel.style.display = 'block';
                // 计算吸附位置：位于头部功能区下方
                const header = document.querySelector('.alert-header-section');
                if (header) {
                    const topPx = header.getBoundingClientRect().bottom;
                    filterPanel.style.top = topPx + 'px';
                }
                // 关闭其他面板
                moduleState.isSortDropdownOpen = false;
                moduleState.isAreaPanelOpen = false;
                const sortDropdown = document.getElementById('sortDropdown');
                if (sortDropdown) sortDropdown.style.display = 'none';
                const areaSelector = document.getElementById('areaSelector');
                if (areaSelector) areaSelector.style.display = 'none';
                setOverlayVisible(true);
            } else {
                filterPanel.classList.remove('active');
                filterPanel.style.display = 'none';
                setOverlayVisible(false);
            }
        } catch (error) {
            console.error('切换筛选面板时出错:', error);
        }
    }

    // 切换排序下拉菜单
    function toggleSortDropdown(event) {
        try {
            if (event) event.stopPropagation();
            
            const sortDropdown = document.getElementById('sortDropdown');
            if (!sortDropdown) return;
            
            moduleState.isSortDropdownOpen = !moduleState.isSortDropdownOpen;
            
            if (moduleState.isSortDropdownOpen) {
                sortDropdown.style.display = 'block';
                const header = document.querySelector('.alert-header-section');
                if (header) {
                    const topPx = header.getBoundingClientRect().bottom;
                    sortDropdown.style.top = topPx + 'px';
                }
                // 关闭其他面板
                moduleState.isFilterPanelOpen = false;
                moduleState.isAreaPanelOpen = false;
                const filterPanel = document.getElementById('filter-panel');
                if (filterPanel) filterPanel.classList.remove('active');
                filterPanel.style.display = 'none';
                const areaSelector = document.getElementById('areaSelector');
                if (areaSelector) areaSelector.style.display = 'none';
                setOverlayVisible(true);
            } else {
                sortDropdown.style.display = 'none';
                setOverlayVisible(false);
            }
        } catch (error) {
            console.error('切换排序下拉菜单时出错:', error);
        }
    }

    // 切换区域选择面板
    function toggleAreaPanel(event) {
        try {
            if (event) event.stopPropagation();

            const areaPanel = document.getElementById('areaSelector');
            if (!areaPanel) return;
            
            moduleState.isAreaPanelOpen = !moduleState.isAreaPanelOpen;
            
            if (moduleState.isAreaPanelOpen) {
                areaPanel.style.display = 'block';
                const header = document.querySelector('.alert-header-section');
                if (header) {
                    const topPx = header.getBoundingClientRect().bottom;
                    areaPanel.style.top = topPx + 'px';
                }
                // 关闭其他面板
                moduleState.isFilterPanelOpen = false;
                moduleState.isSortDropdownOpen = false;
                const filterPanel = document.getElementById('filter-panel');
                if (filterPanel) filterPanel.classList.remove('active');
                const sortDropdown = document.getElementById('sortDropdown');
                if (sortDropdown) sortDropdown.style.display = 'none';
                setOverlayVisible(true);
                populateAreaChildren('lanxi');
                
                // 重置区域列显示
                const areaColumn1 = document.getElementById('areaColumn1');
                if (areaColumn1) areaColumn1.innerHTML = '';
            } else {
                areaPanel.style.display = 'none';
                setOverlayVisible(false);
            }
        } catch (error) {
            console.error('切换区域选择面板时出错:', error);
        }
    }

    // 关闭下拉菜单和面板
    function closeDropdowns(event) {
        try {
            const target = event && event.target;
            const filterPanel = document.getElementById('filter-panel');
            const sortDropdown = document.getElementById('sortDropdown');
            const areaSelector = document.getElementById('areaSelector');

            const clickedInside = target && (
                target.closest('#filter-panel') ||
                target.closest('#sortDropdown') ||
                target.closest('#areaSelector') ||
                target.closest('#filterToggle') ||
                target.closest('#sortToggle') ||
                target.closest('#areaToggle')
            );

            if (!clickedInside) {
                if (moduleState.isFilterPanelOpen && filterPanel) {
                    moduleState.isFilterPanelOpen = false;
                    filterPanel.classList.remove('active');
                    filterPanel.style.display = 'none';
                }
                if (moduleState.isSortDropdownOpen && sortDropdown) {
                    moduleState.isSortDropdownOpen = false;
                    sortDropdown.style.display = 'none';
                }
                if (moduleState.isAreaPanelOpen && areaSelector) {
                    moduleState.isAreaPanelOpen = false;
                    areaSelector.style.display = 'none';
                }
                setOverlayVisible(false);
            }
        } catch (error) {
            console.error('关闭下拉菜单时出错:', error);
        }
    }

    // 查看告警详情
    function viewAlertDetail(alertId) {
        try {
            const alert = AlertDataManager.getAlertById(alertId);
            if (!alert) {
                throw new Error('找不到指定的告警信息');
            }
            
            // 这里可以打开详情模态框
            AlertRenderer.showToast(`查看告警详情: ${alert.title}`, 'info');
            console.log('查看告警详情:', alert);
        } catch (error) {
            console.error('查看告警详情时出错:', error);
            AlertRenderer.showToast('查看详情失败: ' + error.message, 'error');
        }
    }

    // 处理告警
    function handleAlert(alertId) {
        try {
            const alert = AlertDataManager.getAlertById(alertId);
            if (!alert) {
                throw new Error('找不到指定的告警信息');
            }
            
            // 这里可以调用处理API
            AlertRenderer.showToast(`处理告警: ${alert.title}`, 'success');
            console.log('处理告警:', alert);
        } catch (error) {
            console.error('处理告警时出错:', error);
            AlertRenderer.showToast('处理告警失败: ' + error.message, 'error');
        }
    }

    // 公共方法
    return {
        initialize,
        refreshAlertList,
        searchAlerts,
        switchTab,
        toggleFilterPanel,
        toggleSortDropdown,
        toggleAreaPanel,
        closeDropdowns,
        viewAlertDetail,
        handleAlert,
        // 兼容 HTML 内联脚本中的调用
        toggleSortPanel: function() { return toggleSortDropdown(); },
        resetFilters: function() { try { AlertFilterManager.resetFilters(); refreshAlertList(); document.querySelectorAll('#filter-panel .filter-option').forEach(el => el.classList.remove('active')); const d=['#filterTimeAll','#filterAreaAll','#filterLevelAll','#filterUrgencyAll','#filterDurationAll','#filterOccurrenceAll','#filterStatusAll']; d.forEach(sel=>{const el=document.querySelector(sel); if(el) el.classList.add('active');}); } catch (e) { console.error(e); } },
        applyFilters: function() { const picker=document.getElementById('dateRangePicker'); if (picker && picker.style.display !== 'none') { const start=document.getElementById('startDate')?.value||null; const end=document.getElementById('endDate')?.value||null; AlertFilterManager.updateFilterState({ dateRange: { start, end } }); } refreshAlertList(); const p=document.getElementById('filter-panel'); if (p) p.classList.remove('active'); moduleState.isFilterPanelOpen=false; setOverlayVisible(false); },
        closeAreaSelector: function() { const a = document.getElementById('areaSelector'); if (a) a.style.display = 'none'; moduleState.isAreaPanelOpen = false; setOverlayVisible(false); },
        closeModal: function() { const m = document.getElementById('alertModal'); if (m) m.style.display = 'none'; },
        sortAlerts: function(sortType) {
            const map = {
                'time-desc': { field: 'urgency', direction: 'desc' },
                'level-desc': { field: 'level', direction: 'desc' },
                'time-asc': { field: 'time', direction: 'asc' },
                'occurrence-desc': { field: 'occurrence', direction: 'desc' }
            };
            const next = map[sortType] || { field: 'urgency', direction: 'desc' };
            AlertFilterManager.updateSortState(next); 
            refreshAlertList();
            
            // 更新排序选项的激活状态
            document.querySelectorAll('.sort-option').forEach(option => {
                option.classList.remove('active');
            });
            
            const activeButton = document.querySelector(`.sort-option[data-sort="${sortType}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            } else if (!sortType) {
                // 默认选中紧急程度优先
                document.getElementById('sortTimeDesc').classList.add('active');
            }
        },
        selectFilterOption: function(el, type, value) { 
            const state = {}; 
            if (type === 'status') state.status = value; 
            if (type === 'area') state.area = value; 
            if (type === 'level') state.level = value; 
            if (type === 'urgency') state.urgency = value; 
            if (type === 'duration') state.duration = value; 
            AlertFilterManager.updateFilterState(state); 
            if (el && el.parentElement) { 
                el.parentElement.querySelectorAll('.filter-option').forEach(n=>n.classList.remove('active')); 
                el.classList.add('active'); 
            } 
            refreshAlertList(); 
        },
        showDateRangePicker: function() { 
            const p = document.getElementById('dateRangePicker'); 
            if (p) p.style.display = 'block'; 
        },
        updateOccurrenceRange: function(maxVal) { 
            const min=1; 
            const max=Number(maxVal)||100; 
            AlertFilterManager.updateFilterState({ occurrenceRange: { min, max } }); 
            const t=document.getElementById('occurrenceRangeValue'); 
            if (t) t.textContent = `${min}-${max}次`; 
            
            // 更新滑块上的数值显示
            const sliderContainer = document.querySelector('.range-slider-container');
            if (sliderContainer) {
                sliderContainer.setAttribute('data-value', max);
            }
            
            refreshAlertList(); 
        },
        // 应用自定义日期范围
        applyCustomDateRange: function() {
            const startDateInput = document.getElementById('customStartDate');
            const endDateInput = document.getElementById('customEndDate');
            
            if (startDateInput && endDateInput) {
                const startDate = startDateInput.value;
                const endDate = endDateInput.value;
                
                if (startDate && endDate) {
                    AlertFilterManager.updateFilterState({ 
                        dateRange: { start: startDate, end: endDate } 
                    });
                    refreshAlertList();
                }
            }
        },
        selectArea: function(el, area) { 
            moduleState.selectedArea = area;
            AlertFilterManager.updateFilterState({ area }); 
            if (el && el.parentElement) { 
                el.parentElement.querySelectorAll('.area-option').forEach(n=>n.classList.remove('active')); 
                el.classList.add('active'); 
            } 
            refreshAlertList(); 
        }
    };
})();

// 页面加载完成后初始化模块
document.addEventListener('DOMContentLoaded', function() {
    AlertListModule.initialize();
    
    // 确保默认排序为紧急程度优先
    const defaultSortButton = document.getElementById('sortTimeDesc');
    if (defaultSortButton) {
        defaultSortButton.classList.add('active');
    }
});