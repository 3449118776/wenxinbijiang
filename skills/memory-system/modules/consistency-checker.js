class ConsistencyChecker {
  constructor(options = {}) {
    this.options = Object.assign({
      checkCharacterConsistency: true,
      checkForeshadowConsistency: true,
      checkTimelineConsistency: true,
      checkItemConsistency: true,
      severityLevel: 'warning'
    }, options);
  }

  check(work, chapterIdx = null) {
    const report = {
      score: 100,
      issues: [],
      strengths: [],
      checks: {},
      timestamp: Date.now()
    };

    if (!work.longMemory) {
      report.score = 50;
      report.issues.push('缺少长期记忆数据，无法进行完整检查');
      return report;
    }

    if (this.options.checkCharacterConsistency) {
      const charResult = this._checkCharacters(work, chapterIdx);
      report.checks.characters = charResult;
      report.issues.push(...charResult.issues);
      report.strengths.push(...charResult.strengths);
    }

    if (this.options.checkForeshadowConsistency) {
      const fsResult = this._checkForeshadows(work, chapterIdx);
      report.checks.foreshadows = fsResult;
      report.issues.push(...fsResult.issues);
      report.strengths.push(...fsResult.strengths);
    }

    if (this.options.checkTimelineConsistency) {
      const tlResult = this._checkTimeline(work, chapterIdx);
      report.checks.timeline = tlResult;
      report.issues.push(...tlResult.issues);
      report.strengths.push(...tlResult.strengths);
    }

    if (this.options.checkItemConsistency) {
      const itemResult = this._checkItems(work, chapterIdx);
      report.checks.items = itemResult;
      report.issues.push(...itemResult.issues);
      report.strengths.push(...itemResult.strengths);
    }

    const issueCount = report.issues.length;
    report.score = Math.max(0, 100 - issueCount * 6);
    report.score = Math.min(100, report.score);

    return report;
  }

  _checkCharacters(work, chapterIdx) {
    const result = { score: 100, issues: [], strengths: [] };
    const lm = work.longMemory;
    if (!lm.characterProfiles) return result;

    const characters = Object.values(lm.characterProfiles);

    if (characters.length === 0) {
      result.issues.push('还没有建立角色档案');
      result.score = 50;
      return result;
    }

    const missingRoles = characters.filter(c => !c.role || c.role === '龙套');
    if (missingRoles.length > 5 && characters.length > 10) {
      result.issues.push(`有${missingRoles.length}个角色缺少明确的角色定位`);
    }

    const longMissing = characters.filter(c => {
      if (c.role === '龙套') return false;
      const lastSeen = c.lastSeen || 0;
      const current = chapterIdx !== null ? chapterIdx : (lm.chapterIndex ? lm.chapterIndex.length : 0);
      return current - lastSeen > 30;
    });
    if (longMissing.length > 0) {
      longMissing.forEach(c => {
        result.issues.push(`角色"${c.name}"已${(chapterIdx || 0) - c.lastSeen}章未登场，建议安排出场或交代去向`);
      });
    }

    const hasMainChar = characters.some(c =>
      c.role === '主角' || c.role === '女主' || c.role === '男主'
    );
    if (hasMainChar) {
      result.strengths.push('主角设定明确');
    }

    const charsWithMilestones = characters.filter(c =>
      c.milestones && c.milestones.length >= 3
    );
    if (charsWithMilestones.length >= 2) {
      result.strengths.push(`${charsWithMilestones.length}个角色有清晰的成长轨迹`);
    }

    result.score = Math.max(0, 100 - result.issues.length * 8);
    return result;
  }

  _checkForeshadows(work, chapterIdx) {
    const result = { score: 100, issues: [], strengths: [] };
    const lm = work.longMemory;
    if (!lm.foreshadowLedger || lm.foreshadowLedger.length === 0) {
      result.issues.push('还没有记录任何伏笔');
      result.score = 60;
      return result;
    }

    const unresolved = lm.foreshadowLedger.filter(f => f.status === '未解');
    const resolved = lm.foreshadowLedger.filter(f => f.status === '已回收');
    const current = chapterIdx !== null ? chapterIdx : (lm.chapterIndex ? lm.chapterIndex.length : 0);

    const longHanging = unresolved.filter(f => {
      const age = current - (f.chapterIdx || 0);
      return age > 50;
    });
    if (longHanging.length > 3) {
      result.issues.push(`有${longHanging.length}个伏笔悬挂超过50章未回收`);
    }

    const veryOld = unresolved.filter(f => {
      const age = current - (f.chapterIdx || 0);
      return age > 100;
    });
    if (veryOld.length > 0) {
      result.issues.push(`警告：${veryOld.length}个伏笔已悬挂超100章，读者可能已遗忘`);
    }

    if (unresolved.length > 30) {
      result.issues.push(`未解伏笔过多（${unresolved.length}个），容易混乱，建议控制在20个以内`);
    }

    if (resolved.length > 0 && unresolved.length > 0) {
      const ratio = resolved.length / (resolved.length + unresolved.length);
      if (ratio >= 0.3) {
        result.strengths.push(`伏笔回收率良好（${(ratio * 100).toFixed(0)}%）`);
      } else if (ratio < 0.1) {
        result.issues.push('伏笔回收率偏低，建议加快回收节奏');
      }
    }

    const highPriority = unresolved.filter(f => f.strength === 'high');
    if (highPriority.length >= 3 && highPriority.length <= 8) {
      result.strengths.push('有适量的高强度伏笔保持悬念');
    }

    const typeCount = {};
    lm.foreshadowLedger.forEach(f => {
      typeCount[f.type] = (typeCount[f.type] || 0) + 1;
    });
    const types = Object.keys(typeCount).length;
    if (types >= 4) {
      result.strengths.push(`伏笔类型丰富（${types}种），层次分明`);
    }

    result.score = Math.max(0, 100 - result.issues.length * 8);
    return result;
  }

  _checkTimeline(work, chapterIdx) {
    const result = { score: 100, issues: [], strengths: [] };
    const lm = work.longMemory;

    if (!lm.timelineEvents || lm.timelineEvents.length === 0) {
      result.issues.push('时间线事件记录较少');
      result.score = 70;
      return result;
    }

    if (lm.timelineEvents.length >= 5) {
      result.strengths.push('有清晰的时间线记录');
    }

    const hasPast = lm.timelineEvents.some(e => e.time && e.time.includes('前'));
    const hasFuture = lm.timelineEvents.some(e => e.time && e.time.includes('后'));
    if (hasPast && hasFuture) {
      result.strengths.push('时间线包含过去和未来，有纵深感');
    }

    result.score = Math.max(0, 100 - result.issues.length * 8);
    return result;
  }

  _checkItems(work, chapterIdx) {
    const result = { score: 100, issues: [], strengths: [] };
    const lm = work.longMemory;

    if (!lm.itemLedger || Object.keys(lm.itemLedger).length === 0) {
      result.score = 80;
      return result;
    }

    const items = Object.values(lm.itemLedger);
    const lostItems = items.filter(i => i.status === '遗失');
    const activeItems = items.filter(i => i.status === '持有中');

    if (lostItems.length > 0 && lostItems.length / items.length > 0.3) {
      result.issues.push(`较多道具处于遗失状态（${lostItems.length}/${items.length}），记得安排找回或交代去向`);
    }

    const keyItems = items.filter(i => {
      const history = i.history || [];
      return history.length >= 3;
    });
    if (keyItems.length >= 2) {
      result.strengths.push(`${keyItems.length}个关键道具被反复使用，有存在感`);
    }

    result.score = Math.max(0, 100 - result.issues.length * 8);
    return result;
  }

  quickCheck(work, chapterIdx, content) {
    const issues = [];

    if (work.longMemory && work.longMemory.memoryAnchors) {
      const anchors = work.longMemory.memoryAnchors;
      const core = anchors.core || [];
      core.forEach(anchor => {
        const text = anchor.text || '';
        const keywords = text.split(/[，。、\s]+/).filter(w => w.length >= 2);
        if (keywords.length >= 2) {
          let mismatch = false;
          for (const kw of keywords.slice(0, 3)) {
            if (!content.includes(kw)) {
              mismatch = true;
              break;
            }
          }
          if (!mismatch && keywords.length >= 3) {
            issues.push({
              type: 'core_memory_check',
              severity: 'info',
              message: `检测到核心记忆相关内容：${text.slice(0, 40)}`
            });
          }
        }
      });
    }

    return issues;
  }

  getScoreLabel(score) {
    if (score >= 90) return { label: '优秀', color: 'green' };
    if (score >= 75) return { label: '良好', color: 'blue' };
    if (score >= 60) return { label: '一般', color: 'yellow' };
    if (score >= 40) return { label: '需改进', color: 'orange' };
    return { label: '警告', color: 'red' };
  }
}

module.exports = ConsistencyChecker;
