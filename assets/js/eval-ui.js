// eval-ui.js v2 — 通用评价卡片 UI 组件（增强版进度条）
// 被 write.html 和 architecture.html 共用
// 调用入口：window.EvalUI.show(result, onFix)
// result 格式：{ type:'text', moduleName:'正文', totalScore:75, grade:'B+', dimensions:[...], issues:[...], strengths:[...], suggestions:[...] }
(function() {
  'use strict';

  function show(result, onFix) {
    if (!result) return;
    removeOld();

    var overlay = document.createElement('div');
    overlay.id = 'eval-ui-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:12px;';

    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:18px;width:100%;max-width:440px;max-height:88vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,0.2);';

    // 头部：总分 + 等级
    var gradeColor = _gradeColor(result.grade);
    var head = '<div style="padding:20px;text-align:center;border-bottom:1px solid #f0f0f0;">';
    head += '<div style="font-size:13px;color:#888;margin-bottom:4px;">' + (result.moduleName || '') + ' · 质量评价</div>';
    head += '<div style="display:flex;align-items:center;justify-content:center;gap:12px;">';
    head += '<div style="width:72px;height:72px;border-radius:50%;background:conic-gradient(' + gradeColor + ' ' + (result.totalScore * 3.6) + 'deg, #e5e7eb ' + (result.totalScore * 3.6) + 'deg);display:flex;align-items:center;justify-content:center;position:relative;">';
    head += '<div style="width:56px;height:56px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    head += '<span style="font-size:22px;font-weight:700;color:' + gradeColor + ';">' + result.totalScore + '</span>';
    head += '<span style="font-size:10px;color:#999;">/100</span></div></div>';
    head += '<div style="text-align:left;"><span style="font-size:28px;font-weight:800;color:' + gradeColor + ';">' + result.grade + '</span>';
    head += '<div style="font-size:12px;color:#666;">' + _levelText(result.grade) + '</div></div>';
    head += '</div></div>';
    card.innerHTML = head;

    // ===== 维度评分（增强版进度条）=====
    var dims = result.dimensions || [];
    if (dims.length > 0) {
      var dimsHTML = '<div style="padding:16px 16px 12px;"><div style="font-size:12px;color:#888;margin-bottom:10px;font-weight:600;">📊 维度评分</div>';
      dims.forEach(function(d, idx) {
        var barColor = _scoreColor(d.score);
        var barGradient = _scoreGradient(d.score);
        var barWidth = Math.round(d.score * 10) + '%';
        var weightPct = Math.round((d.weight || 0) * 100) + '%';
        // 分数等级标签
        var levelTag = d.score >= 9 ? '优秀' : (d.score >= 7 ? '良好' : (d.score >= 5 ? '及格' : (d.score >= 3 ? '较差' : '很差')));
        // 条形图动画延迟（错峰效果）
        var delayMs = idx * 60;

        dimsHTML += '<div class="eval-dim-row" style="margin-bottom:10px;opacity:0;transform:translateY(8px);animation:evalDimFadeIn 0.35s ease ' + delayMs + 'ms forwards;">';
        // 维度名 + 分数标签 + 权重
        dimsHTML += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:4px;">';
        dimsHTML += '<span style="color:#333;font-weight:500;">' + d.name + '</span>';
        dimsHTML += '<div style="display:flex;align-items:center;gap:6px;">';
        dimsHTML += '<span style="font-size:10px;color:#aaa;">' + weightPct + '</span>';
        dimsHTML += '<span style="font-size:11px;padding:1px 6px;border-radius:4px;background:' + barColor + '20;color:' + barColor + ';font-weight:600;">' + levelTag + '</span>';
        dimsHTML += '<span style="font-size:13px;font-weight:700;color:' + barColor + ';">' + d.score + '<span style="font-size:10px;font-weight:400;color:#bbb;">/' + d.max + '</span></span>';
        dimsHTML += '</div></div>';
        // 增强版进度条（渐变+更厚）
        dimsHTML += '<div style="height:8px;background:#f0f1f3;border-radius:6px;overflow:hidden;position:relative;">';
        dimsHTML += '<div style="height:100%;width:0%;background:' + barGradient + ';border-radius:6px;transition:width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);position:relative;" class="eval-prog-bar" data-width="' + barWidth + '"></div>';
        // 光泽效果
        dimsHTML += '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(180deg,rgba(255,255,255,0.35) 0%,rgba(255,255,255,0) 100%);border-radius:6px 6px 0 0;pointer-events:none;"></div>';
        dimsHTML += '</div>';
        // 低分维度显示问题
        if (d.issues && d.issues.length > 0) {
          dimsHTML += '<div style="font-size:11px;color:#ef4444;margin-top:3px;padding-left:2px;line-height:1.4;">▸ ' + _truncate(d.issues[0], 40) + '</div>';
        }
        dimsHTML += '</div>';
      });
      dimsHTML += '</div>';
      card.innerHTML += dimsHTML;

      // 添加动画关键帧（只加一次）
      if (!document.getElementById('eval-ui-keyframes')) {
        var styleSheet = document.createElement('style');
        styleSheet.id = 'eval-ui-keyframes';
        styleSheet.textContent = '@keyframes evalDimFadeIn{to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(styleSheet);
      }
    }

    // 问题列表
    var issues = result.issues || [];
    if (issues.length > 0) {
      var issuesHTML = '<div style="padding:8px 16px;border-top:1px solid #f0f0f0;"><div style="font-size:12px;color:#ef4444;margin-bottom:6px;font-weight:600;">⚠️ 需改进（' + issues.length + '项）</div>';
      issues.slice(0, 6).forEach(function(iss) {
        issuesHTML += '<div style="font-size:12px;color:#666;padding:3px 0;padding-left:12px;border-left:3px solid #fca5a5;margin-bottom:4px;line-height:1.5;">' + iss + '</div>';
      });
      issuesHTML += '</div>';
      card.innerHTML += issuesHTML;
    }

    // 优点
    var strengths = result.strengths || [];
    if (strengths.length > 0) {
      var strHTML = '<div style="padding:8px 16px;border-top:1px solid #f0f0f0;"><div style="font-size:12px;color:#22c55e;margin-bottom:6px;font-weight:600;">✅ 优点（' + strengths.length + '项）</div>';
      strengths.slice(0, 5).forEach(function(s) {
        strHTML += '<div style="font-size:12px;color:#888;padding:2px 0;">· ' + s + '</div>';
      });
      strHTML += '</div>';
      card.innerHTML += strHTML;
    }

    // 建议
    var suggestions = result.suggestions || [];
    if (suggestions.length > 0) {
      var sugHTML = '<div style="padding:8px 16px;border-top:1px solid #f0f0f0;"><div style="font-size:12px;color:#3b82f6;margin-bottom:6px;font-weight:600;">💡 改进建议</div>';
      suggestions.slice(0, 4).forEach(function(s) {
        sugHTML += '<div style="font-size:12px;color:#555;padding:2px 0;padding-left:12px;border-left:3px solid #93c5fd;margin-bottom:4px;line-height:1.5;">' + s + '</div>';
      });
      sugHTML += '</div>';
      card.innerHTML += sugHTML;
    }

    // 底部按钮
    var btnHTML = '<div style="padding:12px 16px;display:flex;gap:10px;border-top:1px solid #f0f0f0;">';
    btnHTML += '<button onclick="window.EvalUI.close()" style="flex:1;padding:11px;border:1px solid #e5e7eb;background:#fff;border-radius:10px;font-size:14px;color:#666;cursor:pointer;">关闭</button>';
    if (typeof onFix === 'function') {
      btnHTML += '<button id="eval-ui-fix-btn" style="flex:1;padding:11px;background:' + gradeColor + ';color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🔥 按评价加强</button>';
    }
    btnHTML += '</div>';
    card.innerHTML += btnHTML;

    overlay.appendChild(card);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) window.EvalUI.close();
    });
    document.body.appendChild(overlay);

    // 绑定加强按钮
    if (typeof onFix === 'function') {
      setTimeout(function() {
        var fixBtn = document.getElementById('eval-ui-fix-btn');
        if (fixBtn) fixBtn.addEventListener('click', function() {
          window.EvalUI.close();
          onFix(result);
        });
      }, 50);
    }

    // 卡片入场动画
    card.style.transform = 'scale(0.9)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.25s ease';
    requestAnimationFrame(function() {
      card.style.transform = 'scale(1)';
      card.style.opacity = '1';
    });

    // 进度条宽度动画（延迟触发，让卡片先弹出）
    setTimeout(function() {
      var bars = card.querySelectorAll('.eval-prog-bar');
      bars.forEach(function(bar) {
        var targetWidth = bar.getAttribute('data-width') || '50%';
        bar.style.width = targetWidth;
      });
    }, 120);
  }

  function close() {
    var el = document.getElementById('eval-ui-overlay');
    if (el) el.remove();
  }

  function removeOld() {
    var el = document.getElementById('eval-ui-overlay');
    if (el) el.remove();
  }

  // ===== 颜色工具 =====
  function _gradeColor(grade) {
    switch (grade) {
      case 'S': return '#8b5cf6';
      case 'A': return '#22c55e';
      case 'B+': return '#3b82f6';
      case 'B': return '#f59e0b';
      case 'C': return '#f97316';
      default: return '#ef4444';
    }
  }

  function _scoreColor(score) {
    if (score >= 9) return '#22c55e';
    if (score >= 7) return '#3b82f6';
    if (score >= 5) return '#f59e0b';
    if (score >= 3) return '#f97316';
    return '#ef4444';
  }

  function _scoreGradient(score) {
    if (score >= 9) return 'linear-gradient(90deg,#22c55e,#16a34a)';
    if (score >= 7) return 'linear-gradient(90deg,#3b82f6,#2563eb)';
    if (score >= 5) return 'linear-gradient(90deg,#f59e0b,#d97706)';
    if (score >= 3) return 'linear-gradient(90deg,#f97316,#ea580c)';
    return 'linear-gradient(90deg,#ef4444,#dc2626)';
  }

  function _levelText(grade) {
    switch (grade) {
      case 'S': return '顶级水准';
      case 'A': return '优秀';
      case 'B+': return '良好';
      case 'B': return '合格';
      case 'C': return '需改进';
      default: return '较差';
    }
  }

  function _truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
  }

  window.EvalUI = {
    show: show,
    close: close
  };
})();