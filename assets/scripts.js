// 页面管理
let currentPage = 'home-page';
let previousPage = '';

function showPage(pageId) {
    // 隐藏当前页面
    const currentPageElement = document.getElementById(currentPage);
    if (currentPageElement) {
        currentPageElement.classList.add('hidden');
    }
    
    // 显示目标页面
    const targetPageElement = document.getElementById(pageId);
    if (targetPageElement) {
        targetPageElement.classList.remove('hidden');
    }
    
    // 更新页面历史
    previousPage = currentPage;
    currentPage = pageId;
}

function goBack() {
    if (previousPage && previousPage !== currentPage) {
        showPage(previousPage);
    } else {
        // 默认返回首页
        showPage('home-page');
    }
}

// 导航栏激活状态管理
function activateTab(tabElement) {
    // 移除所有导航项的活跃状态
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 设置当前点击项为活跃状态
    tabElement.classList.add('active');
}

// 表单验证
function validateForm() {
    const type = document.getElementById('feedback-type');
    const description = document.getElementById('feedback-description');
    const submitBtn = document.getElementById('submit-feedback');
    
    if (type && description && submitBtn) {
        if (type.value && description.value.trim() !== '') {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
}

// 字符计数
function updateCharCount() {
    const textarea = document.getElementById('feedback-description');
    const countEl = document.getElementById('char-count');
    
    if (textarea && countEl) {
        const count = textarea.value.length;
        countEl.textContent = `${count}/500`;
        
        // 限制最大输入
        if (count > 500) {
            textarea.value = textarea.value.substring(0, 500);
            countEl.textContent = `500/500`;
        }
        
        validateForm();
    }
}

// 模拟图片上传预览
function handleImageUpload() {
    const previewContainer = document.getElementById('preview-container');
    const uploadArea = document.getElementById('upload-area');
    
    if (previewContainer && uploadArea) {
        // 最多上传3张图片
        if (previewContainer.children.length >= 3) {
            return;
        }
        
        // 模拟上传一张图片
        const preview = document.createElement('div');
        preview.className = 'preview-item';
        
        // 模拟图片
        const img = document.createElement('img');
        img.src = 'https://picsum.photos/200/200?' + Math.random();
        img.alt = '反馈截图示例';
        img.className = 'preview-image';
        
        // 删除按钮
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.onclick = function() {
            previewContainer.removeChild(preview);
        };
        
        preview.appendChild(img);
        preview.appendChild(deleteBtn);
        previewContainer.appendChild(preview);
    }
}

// 提交反馈
function submitFeedback() {
    const submitBtn = document.getElementById('submit-feedback');
    
    if (submitBtn) {
        submitBtn.textContent = '提交中...';
        submitBtn.disabled = true;
        
        // 模拟提交延迟
        setTimeout(() => {
            // 显示成功提示
            const toast = document.getElementById('success-toast');
            if (toast) {
                toast.classList.add('show');
                
                // 重置表单
                const feedbackType = document.getElementById('feedback-type');
                const feedbackDescription = document.getElementById('feedback-description');
                const contactInfo = document.getElementById('contact-info');
                const previewContainer = document.getElementById('preview-container');
                const charCount = document.getElementById('char-count');
                
                if (feedbackType) feedbackType.value = '';
                if (feedbackDescription) feedbackDescription.value = '';
                if (contactInfo) contactInfo.value = '';
                if (previewContainer) previewContainer.innerHTML = '';
                if (charCount) charCount.textContent = '0/500';
                
                submitBtn.textContent = '提交反馈';
                validateForm();
                
                // 3秒后隐藏提示
                setTimeout(() => {
                    if (toast) {
                        toast.classList.remove('show');
                    }
                }, 3000);
            }
        }, 1500);
    }
}

// 摇一摇检测
let shakeEnabled = false;
let lastTime = 0;
let x = 0, y = 0, z = 0, lastX = 0, lastY = 0, lastZ = 0;
const threshold = 15; // 摇晃阈值

function handleShake(event) {
    if (!shakeEnabled) return;
    
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastTime;
    
    if (timeDifference > 100) {
        const acceleration = event.accelerationIncludingGravity;
        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;
        
        const differenceX = Math.abs(x - lastX);
        const differenceY = Math.abs(y - lastY);
        const differenceZ = Math.abs(z - lastZ);
        
        if (differenceX > threshold || differenceY > threshold || differenceZ > threshold) {
            // 显示摇一摇提示
            const prompt = document.getElementById('shake-prompt');
            if (prompt) {
                prompt.classList.remove('hidden');
                
                // 500ms后隐藏提示并进入反馈页面
                setTimeout(() => {
                    prompt.classList.add('hidden');
                    showPage('feedback-form-page');
                }, 500);
            }
        }
        
        lastTime = currentTime;
        lastX = x;
        lastY = y;
        lastZ = z;
    }
}

// 日期筛选器功能
function initDateFilters() {
    const dateFilters = document.querySelectorAll('.date-filter');
    dateFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            dateFilters.forEach(f => {
                f.classList.remove('bg-primary/10', 'text-primary');
                f.classList.add('bg-white', 'text-gray-medium');
            });
            this.classList.remove('bg-white', 'text-gray-medium');
            this.classList.add('bg-primary/10', 'text-primary');
        });
    });
}

// 报表切换功能
function initReportSwitching() {
    const reportItems = document.querySelectorAll('.report-item');
    reportItems.forEach(item => {
        item.addEventListener('click', function() {
            const reportType = this.getAttribute('data-report');
            if (!reportType) return;
            
            // 显示报表内容区域
            const reportContentArea = document.getElementById('report-content-area');
            if (reportContentArea) {
                reportContentArea.classList.remove('hidden');
            }
            
            // 隐藏所有报表详情
            document.querySelectorAll('.report-detail').forEach(report => {
                report.classList.add('hidden');
            });
            
            // 显示选中的报表详情
            const selectedReport = document.getElementById(`${reportType}-report`);
            if (selectedReport) {
                selectedReport.classList.remove('hidden');
            }
            
            // 更新标题
            const pageTitle = document.getElementById('pageTitle');
            const reportTitles = {
                'workorder': '工单统计报表',
                'pump': '泵站运行报表',
                'attendance': '人员考勤报表',
                'site': '综合分析报表'
            };
            
            if (pageTitle) {
                pageTitle.textContent = reportTitles[reportType] || '报表中心';
            }
            
            // 显示返回按钮
            const backToReports = document.getElementById('back-to-reports');
            if (backToReports) {
                backToReports.classList.remove('hidden');
            }
        });
    });
    
    // 返回报表中心按钮
    const backToReports = document.getElementById('back-to-reports');
    if (backToReports) {
        backToReports.addEventListener('click', function() {
            // 隐藏报表内容区域和返回按钮
            const reportContentArea = document.getElementById('report-content-area');
            if (reportContentArea) {
                reportContentArea.classList.add('hidden');
            }
            
            document.querySelectorAll('.report-detail').forEach(report => {
                report.classList.add('hidden');
            });
            
            if (backToReports) {
                backToReports.classList.add('hidden');
            }
            
            // 更新标题
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = '报表中心';
            }
        });
    }
}

// 初始化所有页面功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化导航栏点击事件
    document.querySelectorAll('.tab-item').forEach(item => {
        item.addEventListener('click', function() {
            activateTab(this);
        });
    });
    
    // 初始化表单验证
    const feedbackType = document.getElementById('feedback-type');
    const feedbackDescription = document.getElementById('feedback-description');
    
    if (feedbackType) {
        feedbackType.addEventListener('change', validateForm);
    }
    
    if (feedbackDescription) {
        feedbackDescription.addEventListener('input', updateCharCount);
    }
    
    // 初始化图片上传
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', handleImageUpload);
    }
    
    // 初始化提交按钮
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', submitFeedback);
    }
    
    // 初始化摇一摇开关
    const shakeToggle = document.getElementById('shake-feedback-toggle');
    if (shakeToggle) {
        shakeToggle.addEventListener('change', function() {
            shakeEnabled = this.checked;
        });
    }
    
    // 初始化设备运动监听
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleShake, false);
    }
    
    // 初始化日期筛选器
    initDateFilters();
    
    // 初始化报表切换功能
    initReportSwitching();
});
