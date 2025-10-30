// 告警渲染模块
const AlertRenderer = (function() {
    // HTML转义函数
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 获取状态文本
    function getStatusText(status) {
        const statusMap = {
            'unhandled': '未处理',
            'processing': '处理中',
            'handled': '已处理'
        };
        return statusMap[status] || '未知状态';
    }

    // 获取状态图标
    function getStatusIcon(status) {
        const iconMap = {
            'unhandled': 'bi-exclamation-circle',
            'processing': 'bi-arrow-repeat',
            'handled': 'bi-check-circle'
        };
        return iconMap[status] || 'bi-question-circle';
    }

    // 获取级别样式
    function getLevelClass(level) {
        const levelMap = {
            'level1': 'alert-level-1',
            'level2': 'alert-level-2',
            'level3': 'alert-level-3',
            'level4': 'alert-level-4'
        };
        return levelMap[level] || 'alert-level-4';
    }

    // 获取紧急程度样式
    function getUrgencyClass(urgency) {
        const urgencyMap = {
            'critical': 'alert-urgency-critical',
            'important': 'alert-urgency-important',
            'normal': 'alert-urgency-normal'
        };
        return urgencyMap[urgency] || 'alert-urgency-normal';
    }

    // 计算持续时长文本
    function getDurationText(alert) {
        try {
            const start = new Date(alert.createdAt);
            const end = alert.status === 'handled' && alert.updatedAt ? new Date(alert.updatedAt) : new Date();
            const ms = Math.max(0, end - start);
            const minutes = Math.floor(ms / 60000);
            if (minutes < 60) return `${minutes}分钟`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}小时`;
            const days = Math.floor(hours / 24);
            return `${days}天`;
        } catch { return '-'; }
    }

    // 获取发生次数（示例映射）
    function getOccurrenceCount(alert) {
        return alert.occurrence === '多次发生' ? 5 : 1;
    }

    // 渲染单个告警项
    function renderAlertItem(alert) {
        try {
            const levelClass = getLevelClass(alert.level);
            const urgencyClass = getUrgencyClass(alert.urgency);
            const durationText = getDurationText(alert);
            const occurrenceCount = getOccurrenceCount(alert);
            
            // 只有在未处理状态时才显示处理按钮
            const handleButton = alert.status === 'unhandled' ? 
                `<button class="btn-handle-text" onclick="AlertListModule.handleAlert(${alert.id})">去处理</button>` : '';
            
            return `
                <div class="alert-item" data-alert-id="${alert.id}">
                    <div class="alert-header">
                        <div class="alert-header-left">
                            <div class="alert-level ${levelClass}">${escapeHtml(alert.level.replace('level', '级别'))}</div>
                            <div class="alert-urgency ${urgencyClass}">${escapeHtml(alert.urgency === 'critical' ? '紧急' : alert.urgency === 'important' ? '重要' : '一般')}</div>
                        </div>
                        <div class="alert-header-right">
                            ${handleButton}
                        </div>
                    </div>
                    <div class="alert-content">
                        <h3 class="alert-title alert-title-link" onclick="AlertListModule.viewAlertDetail(${alert.id})">${escapeHtml(alert.title)}</h3>
                        <div class="alert-station"><i class="bi bi-geo-alt"></i><span class="station-name">${escapeHtml(alert.station)}</span></div>
                        <p class="alert-description">${escapeHtml(alert.description)}</p>
                        <div class="alert-meta compact-row">
                            <span class="alert-meta-item">
                                <span class="alert-duration-label">持续时长：</span>
                                <span class="alert-duration-value">${escapeHtml(durationText)}</span>
                            </span>
                            <span class="alert-meta-item">
                                <span class="alert-occurrence-label">发生次数：</span>
                                <span class="alert-occurrence-value">${escapeHtml(String(occurrenceCount))}</span>
                            </span>
                        </div>
                    </div>
                    
                </div>
            `;
        } catch (error) {
            console.error('渲染告警项时出错:', error);
            return '<div class="alert-item error">渲染告警信息时出错</div>';
        }
    }

    // 渲染告警列表
    function renderAlertList(alerts, containerId = 'alertList') {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`找不到容器元素: ${containerId}`);
            }

            if (!Array.isArray(alerts)) {
                throw new Error('告警数据必须是数组');
            }

            if (alerts.length === 0) {
                container.innerHTML = `
                    <div class="no-alerts">
                        <div class="no-alerts-icon">📋</div>
                        <div class="no-alerts-text">暂无告警信息</div>
                    </div>
                `;
                return;
            }

            const alertItems = alerts.map(alert => renderAlertItem(alert)).join('');
            container.innerHTML = alertItems;
        } catch (error) {
            console.error('渲染告警列表时出错:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <div class="error-icon">⚠️</div>
                        <div class="error-text">加载告警列表时出错</div>
                    </div>
                `;
            }
        }
    }

    // 渲染标签页计数
    function renderTabCounts(counts) {
        try {
            const tabElements = {
                'all': document.querySelector('[data-tab="all"] .tab-count'),
                'unhandled': document.querySelector('[data-tab="unhandled"] .tab-count'),
                'processing': document.querySelector('[data-tab="processing"] .tab-count'),
                'handled': document.querySelector('[data-tab="handled"] .tab-count')
            };

            Object.keys(tabElements).forEach(tab => {
                const element = tabElements[tab];
                if (element && counts[tab] !== undefined) {
                    element.textContent = counts[tab];
                }
            });
        } catch (error) {
            console.error('更新标签页计数时出错:', error);
        }
    }

    // 渲染筛选面板状态
    function renderFilterState(filterState) {
        try {
            // 更新搜索框
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = filterState.searchText || '';
            }

            // 更新状态筛选
            const statusElements = document.querySelectorAll('[data-filter="status"]');
            statusElements.forEach(element => {
                if (element.dataset.value === filterState.status) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            });

            // 更新日期范围显示
            const dateRangeText = document.getElementById('dateRangeText');
            if (dateRangeText && filterState.dateRange.start && filterState.dateRange.end) {
                const startDate = new Date(filterState.dateRange.start).toLocaleDateString();
                const endDate = new Date(filterState.dateRange.end).toLocaleDateString();
                dateRangeText.textContent = `${startDate} - ${endDate}`;
            }
        } catch (error) {
            console.error('渲染筛选状态时出错:', error);
        }
    }

    // 错误处理函数
    function handleError(error, context = '') {
        console.error(`[AlertRenderer Error] ${context}:`, error);
        
        // 显示用户友好的错误信息
        showToast(`渲染操作失败: ${error.message || '未知错误'}`, 'error');
        
        return null;
    }

    // 安全的渲染单个告警项
    function safeRenderAlertItem(alert) {
        try {
            if (!alert || typeof alert !== 'object') {
                throw new Error('告警数据格式无效');
            }
            
            // 验证必填字段
            const requiredFields = ['id', 'title', 'description', 'status', 'level', 'urgency'];
            const missingFields = requiredFields.filter(field => !alert[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`告警数据缺少必要字段: ${missingFields.join(', ')}`);
            }
            
            return renderAlertItem(alert);
        } catch (error) {
            return handleError(error, '渲染告警项');
        }
    }

    // 安全的渲染告警列表
    function safeRenderAlertList(alerts, containerId = 'alertList') {
        try {
            if (!Array.isArray(alerts)) {
                throw new Error('告警数据必须是数组');
            }
            
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`找不到容器元素: ${containerId}`);
            }
            
            return renderAlertList(alerts, containerId);
        } catch (error) {
            return handleError(error, '渲染告警列表');
        }
    }

    // 安全的渲染标签页计数
    function safeRenderTabCounts(counts) {
        try {
            if (!counts || typeof counts !== 'object') {
                throw new Error('计数数据格式无效');
            }
            
            return renderTabCounts(counts);
        } catch (error) {
            return handleError(error, '渲染标签页计数');
        }
    }

    // 安全的渲染筛选状态
    function safeRenderFilterState(filterState) {
        try {
            if (!filterState || typeof filterState !== 'object') {
                throw new Error('筛选状态数据格式无效');
            }
            
            return renderFilterState(filterState);
        } catch (error) {
            return handleError(error, '渲染筛选状态');
        }
    }

    // 显示提示信息
    function showToast(message, type = 'info') {
        try {
            if (!message || typeof message !== 'string') {
                throw new Error('提示信息必须是字符串');
            }
            
            // 验证类型参数
            const validTypes = ['info', 'success', 'error', 'warning'];
            if (!validTypes.includes(type)) {
                type = 'info'; // 默认类型
            }
            
            // 移除现有的提示
            const existingToast = document.querySelector('.toast-message');
            if (existingToast) {
                existingToast.remove();
            }

            // 创建新的提示
            const toast = document.createElement('div');
            toast.className = `toast-message toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <span class="toast-text">${escapeHtml(message)}</span>
                </div>
            `;

            document.body.appendChild(toast);

            // 显示动画
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            // 自动隐藏
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('显示提示信息时出错:', error);
        }
    }

    // 公共方法
    return {
        escapeHtml,
        getStatusText,
        renderAlertList,
        renderTabCounts,
        renderFilterState,
        showToast
    };
})();
