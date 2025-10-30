// 告警数据管理模块
const AlertDataManager = (function() {
    // 模拟告警数据
    const alertData = [
        {
            id: 1,
            title: "二号泵站压力异常",
            type: "警告",
            description: "出水压力超过阈值5.5MPa，当前值5.8MPa",
            time: "2023-06-15 14:32",
            severity: "warning",
            area: "area1",
            status: "unhandled",
            level: "level2",
            urgency: "important",
            occurrence: "多次发生",
            station: "二号泵站",
            createdAt: "2023-06-15T14:32:00",
            updatedAt: "2023-06-15T14:32:00",
            assignee: "张三"
        },
        {
            id: 2,
            title: "三号泵站故障停机",
            type: "紧急",
            description: "电机过载保护触发，设备自动停机",
            time: "2023-06-15 10:15",
            severity: "danger",
            area: "area2",
            status: "handled",
            level: "level1",
            urgency: "critical",
            occurrence: "单次发生",
            station: "三号泵站",
            createdAt: "2023-06-15T10:15:00",
            updatedAt: "2023-06-15T12:30:00",
            assignee: "李四"
        },
        {
            id: 3,
            title: "一号泵站水位过高",
            type: "警告",
            description: "集水池水位超过安全线，当前值2.8米",
            time: "2023-06-15 09:20",
            severity: "warning",
            area: "area1",
            status: "unhandled",
            level: "level2",
            urgency: "important",
            occurrence: "多次发生",
            station: "一号泵站",
            createdAt: "2023-06-15T09:20:00",
            updatedAt: "2023-06-15T09:20:00",
            assignee: "王五"
        },
        {
            id: 4,
            title: "四号泵站电机过热",
            type: "紧急",
            description: "电机温度达到85℃，超过安全阈值",
            time: "2023-06-14 16:45",
            severity: "danger",
            area: "area3",
            status: "unhandled",
            level: "level1",
            urgency: "critical",
            occurrence: "多次发生",
            station: "四号泵站",
            createdAt: "2023-06-14T16:45:00",
            updatedAt: "2023-06-14T16:45:00",
            assignee: "赵六"
        },
        {
            id: 5,
            title: "五号泵站流量异常",
            type: "一般",
            description: "瞬时流量超出正常范围±10%",
            time: "2023-06-14 14:10",
            severity: "info",
            area: "area2",
            status: "handled",
            level: "level4",
            urgency: "normal",
            occurrence: "单次发生",
            station: "五号泵站",
            createdAt: "2023-06-14T14:10:00",
            updatedAt: "2023-06-14T15:20:00",
            assignee: "钱七"
        },
        {
            id: 6,
            title: "六号泵站设备维护",
            type: "一般",
            description: "定期维护检查中",
            time: "2023-06-16 09:00",
            severity: "info",
            area: "area3",
            status: "processing",
            level: "level4",
            urgency: "normal",
            occurrence: "多次发生",
            station: "六号泵站",
            createdAt: "2023-06-16T09:00:00",
            updatedAt: "2023-06-16T09:00:00",
            assignee: "孙八"
        }
    ];

    // 获取所有告警数据
    function getAllAlerts() {
        return [...alertData];
    }

    // 根据ID获取告警
    function getAlertById(id) {
        return alertData.find(alert => alert.id === id);
    }

    // 获取按状态分组的告警数量
    function getAlertCounts() {
        const allCount = alertData.length;
        const unhandledCount = alertData.filter(alert => alert.status === 'unhandled').length;
        const processingCount = alertData.filter(alert => alert.status === 'processing').length;
        const handledCount = alertData.filter(alert => alert.status === 'handled').length;
        
        return {
            all: allCount,
            unhandled: unhandledCount,
            processing: processingCount,
            handled: handledCount
        };
    }

    // 验证告警数据格式
    function validateAlertData(alert) {
        const requiredFields = ['id', 'title', 'type', 'description', 'time', 'status', 'level', 'urgency'];
        const missingFields = requiredFields.filter(field => !alert.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
            throw new Error(`告警数据缺少必要字段: ${missingFields.join(', ')}`);
        }
        
        // 验证状态值
        const validStatuses = ['unhandled', 'processing', 'handled'];
        if (!validStatuses.includes(alert.status)) {
            throw new Error(`无效的告警状态: ${alert.status}`);
        }
        
        // 验证级别值
        const validLevels = ['level1', 'level2', 'level3', 'level4'];
        if (!validLevels.includes(alert.level)) {
            throw new Error(`无效的告警级别: ${alert.level}`);
        }
        
        // 验证区域值
        const validAreas = ['area1', 'area2', 'area3', 'site1', 'site2', 'site3', 'site4', 'site5', 'site6'];
        if (alert.area && !validAreas.includes(alert.area)) {
            console.warn(`未知的区域代码: ${alert.area}`);
        }
        
        return true;
    }

    // 错误处理函数
    function handleError(error, context = '') {
        console.error(`[AlertDataManager Error] ${context}:`, error);
        
        // 显示用户友好的错误信息
        if (typeof AlertListModule !== 'undefined' && AlertListModule.showToast) {
            AlertListModule.showToast(`操作失败: ${error.message || '未知错误'}`, 'error');
        }
        
        return null;
    }

    // 安全的获取告警数据
    function safeGetAllAlerts() {
        try {
            return getAllAlerts();
        } catch (error) {
            return handleError(error, '获取告警数据');
        }
    }

    // 安全的根据ID获取告警
    function safeGetAlertById(id) {
        try {
            if (!id || typeof id !== 'number') {
                throw new Error('无效的告警ID');
            }
            
            const alert = getAlertById(id);
            if (!alert) {
                throw new Error(`未找到ID为 ${id} 的告警`);
            }
            
            return alert;
        } catch (error) {
            return handleError(error, '根据ID获取告警');
        }
    }

    // 安全的获取告警数量统计
    function safeGetAlertCounts() {
        try {
            return getAlertCounts();
        } catch (error) {
            return handleError(error, '获取告警统计');
        }
    }

    // 公共方法
    return {
        getAllAlerts,
        getAlertById,
        getAlertCounts,
        validateAlertData,
        safeGetAllAlerts,
        safeGetAlertById,
        safeGetAlertCounts,
        handleError
    };
})();