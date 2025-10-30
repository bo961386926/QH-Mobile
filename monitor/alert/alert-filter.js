// 告警筛选和排序模块
const AlertFilterManager = (function() {
    // 筛选状态
    let filterState = {
        searchText: '',
        status: 'all',
        dateRange: { start: null, end: null },
        area: 'all',
        level: 'all',
        urgency: 'all',
        duration: 'all',
        occurrenceRange: { min: 1, max: 10 }
    };

    // 排序状态 - 修改默认排序为紧急程度优先
    let sortState = {
        field: 'urgency',
        direction: 'desc'
    };

    // 防抖搜索函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 应用筛选条件
    function applyFilters(alerts) {
        try {
            return alerts.filter(alert => {
                // 搜索文本筛选
                if (filterState.searchText) {
                    const searchLower = filterState.searchText.toLowerCase();
                    const matchesSearch = 
                        alert.title.toLowerCase().includes(searchLower) ||
                        alert.description.toLowerCase().includes(searchLower) ||
                        alert.station.toLowerCase().includes(searchLower);
                    if (!matchesSearch) return false;
                }

                // 状态筛选
                if (filterState.status !== 'all' && alert.status !== filterState.status) {
                    return false;
                }

                // 区域筛选 - 支持多级区域筛选
                if (filterState.area !== 'all') {
                    // 如果筛选的是特定区域，检查告警是否属于该区域或其子区域
                    if (alert.area !== filterState.area) {
                        // 检查是否是子区域
                        const areaPrefix = filterState.area.replace(/\d+$/, '');
                        const alertAreaPrefix = alert.area.replace(/\d+$/, '');
                        
                        // 对于片区(site)筛选站点，需要特殊处理
                        if (filterState.area.startsWith('area') && alert.area.startsWith('site')) {
                            // 片区与站点的对应关系
                            const areaToSiteMap = {
                                'area1': ['site1', 'site2'],
                                'area2': ['site3', 'site4'],
                                'area3': ['site5', 'site6']
                            };
                            
                            if (!areaToSiteMap[filterState.area] || 
                                !areaToSiteMap[filterState.area].includes(alert.area)) {
                                return false;
                            }
                        } else if (!alert.area.startsWith(filterState.area)) {
                            // 其他情况，检查区域前缀是否匹配
                            return false;
                        }
                    }
                }

                // 级别筛选
                if (filterState.level !== 'all' && alert.level !== filterState.level) {
                    return false;
                }

                // 紧急程度筛选
                if (filterState.urgency !== 'all' && alert.urgency !== filterState.urgency) {
                    return false;
                }

                // 日期范围筛选
                if (filterState.dateRange.start && filterState.dateRange.end) {
                    const alertDate = new Date(alert.createdAt);
                    const startDate = new Date(filterState.dateRange.start);
                    const endDate = new Date(filterState.dateRange.end);
                    
                    if (alertDate < startDate || alertDate > endDate) {
                        return false;
                    }
                }

                // 发生次数筛选
                const occurrenceNum = alert.occurrence === '多次发生' ? 5 : 1;
                if (occurrenceNum < filterState.occurrenceRange.min || 
                    occurrenceNum > filterState.occurrenceRange.max) {
                    return false;
                }

                return true;
            });
        } catch (error) {
            console.error('筛选告警数据时出错:', error);
            return alerts; // 出错时返回原始数据
        }
    }

    // 应用排序
    function applySorting(alerts) {
        try {
            return [...alerts].sort((a, b) => {
                let valueA, valueB;

                switch (sortState.field) {
                    case 'time':
                        valueA = new Date(a.createdAt);
                        valueB = new Date(b.createdAt);
                        break;
                    case 'level':
                        const levelOrder = { level1: 1, level2: 2, level3: 3, level4: 4 };
                        valueA = levelOrder[a.level] || 4;
                        valueB = levelOrder[b.level] || 4;
                        break;
                    case 'title':
                        valueA = a.title.toLowerCase();
                        valueB = b.title.toLowerCase();
                        break;
                    case 'occurrence':
                        // 按发生次数排序
                        const occurrenceMap = { '多次发生': 5, '单次发生': 1 };
                        valueA = occurrenceMap[a.occurrence] || 1;
                        valueB = occurrenceMap[b.occurrence] || 1;
                        break;
                    case 'urgency':
                        // 按紧急程度排序：紧急 > 重要 > 普通
                        const urgencyOrder = { critical: 3, important: 2, normal: 1 };
                        valueA = urgencyOrder[a.urgency] || 1;
                        valueB = urgencyOrder[b.urgency] || 1;
                        break;
                    default:
                        valueA = a[sortState.field];
                        valueB = b[sortState.field];
                }

                if (sortState.direction === 'desc') {
                    return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                } else {
                    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                }
            });
        } catch (error) {
            console.error('排序告警数据时出错:', error);
            return alerts; // 出错时返回原始数据
        }
    }

    // 筛选并排序告警
    function filterAndSortAlerts(alerts) {
        const filtered = applyFilters(alerts);
        return applySorting(filtered);
    }

    // 更新筛选状态
    function updateFilterState(newState) {
        filterState = { ...filterState, ...newState };
    }

    // 更新排序状态
    function updateSortState(newState) {
        sortState = { ...sortState, ...newState };
    }

    // 重置筛选条件
    function resetFilters() {
        filterState = {
            searchText: '',
            status: 'all',
            dateRange: { start: null, end: null },
            area: 'all',
            level: 'all',
            urgency: 'all',
            duration: 'all',
            occurrenceRange: { min: 1, max: 10 }
        };
    }

    // 获取当前筛选状态
    function getFilterState() {
        return { ...filterState };
    }

    // 获取当前排序状态
    function getSortState() {
        return { ...sortState };
    }

    // 验证日期范围
    function validateDateRange(startDate, endDate) {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                throw new Error('开始日期不能晚于结束日期');
            }
            
            const today = new Date();
            if (end > today) {
                throw new Error('结束日期不能晚于当前日期');
            }
        }
        return true;
    }

    // 错误处理函数
    function handleError(error, context = '') {
        console.error(`[AlertFilterManager Error] ${context}:`, error);
        
        // 显示用户友好的错误信息
        if (typeof AlertListModule !== 'undefined' && AlertListModule.showToast) {
            AlertListModule.showToast(`筛选操作失败: ${error.message || '未知错误'}`, 'error');
        }
        
        return null;
    }

    // 安全的筛选和排序告警
    function safeFilterAndSortAlerts(alerts) {
        try {
            if (!Array.isArray(alerts)) {
                throw new Error('告警数据格式无效');
            }
            
            if (alerts.length === 0) {
                return alerts; // 空数组直接返回
            }
            
            return filterAndSortAlerts(alerts);
        } catch (error) {
            return handleError(error, '筛选排序告警数据');
        }
    }

    // 安全的更新筛选状态
    function safeUpdateFilterState(newState) {
        try {
            if (typeof newState !== 'object' || newState === null) {
                throw new Error('筛选状态格式无效');
            }
            
            // 验证日期范围
            if (newState.dateRange) {
                validateDateRange(newState.dateRange.start, newState.dateRange.end);
            }
            
            updateFilterState(newState);
            return true;
        } catch (error) {
            return handleError(error, '更新筛选状态');
        }
    }

    // 安全的更新排序状态
    function safeUpdateSortState(newState) {
        try {
            if (typeof newState !== 'object' || newState === null) {
                throw new Error('排序状态格式无效');
            }
            
            const validFields = ['time', 'level', 'title', 'urgency', 'occurrence'];
            if (newState.field && !validFields.includes(newState.field)) {
                throw new Error(`无效的排序字段: ${newState.field}`);
            }
            
            if (newState.direction && !['asc', 'desc'].includes(newState.direction)) {
                throw new Error(`无效的排序方向: ${newState.direction}`);
            }
            
            updateSortState(newState);
            return true;
        } catch (error) {
            return handleError(error, '更新排序状态');
        }
    }

    // 安全的验证日期范围
    function safeValidateDateRange(startDate, endDate) {
        try {
            return validateDateRange(startDate, endDate);
        } catch (error) {
            return handleError(error, '验证日期范围');
        }
    }

    // 公共方法
    return {
        debounce,
        filterAndSortAlerts,
        updateFilterState,
        updateSortState,
        resetFilters,
        getFilterState,
        getSortState,
        validateDateRange,
        safeFilterAndSortAlerts,
        safeUpdateFilterState,
        safeUpdateSortState,
        safeValidateDateRange,
        handleError
    };
})();