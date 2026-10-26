const Report = (() => {

  const has = v => v != null && String(v).trim() !== '';
  const dash = v => has(v) ? String(v).trim() : '—';

  const linkTc = (url, tc) => {
    if (!has(url) && !has(tc)) return '—';
    if (has(url) && has(tc))  return `${url} (Таймкод: ${tc})`;
    if (has(url))             return url;
    return `Таймкод: ${tc}`;
  };

  const DAYS_FULL = [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
    'Четверг', 'Пятница', 'Суббота'
  ];
  const MONTHS_GEN = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const formatDateLong = iso => {
    if (!has(iso)) return '';
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return '';
    const date = new Date(y, m - 1, d);
    return `${DAYS_FULL[date.getDay()]}, ${d} ${MONTHS_GEN[m - 1]}`;
  };

  const notDone = (key, reason) => {
    let line = `❌ ${key}: Не удалось выполнить на текущей неделе`;
    if (has(reason)) line += ` (${reason.trim()})`;
    line += '.';
    return line;
  };

  const sectionHeader = (key, firstDate) => {
    let h = `✅ ${key}:`;
    if (has(firstDate)) h += ` 📅 ${formatDateLong(firstDate)}:`;
    return h;
  };

  const computeEventNumber = (events, idx) => {
    const event = events[idx];
    let num = 0;
    for (let i = 0; i <= idx; i++) {
      if (events[i].type === event.type) num++;
    }
    return num;
  };

  const eventLabel = (e, num) => {
    const t = EVENT_TYPES.find(x => x.value === e.type);
    const name = t ? t.name : 'мероприятие';
    return `Наблюдение за проведением мероприятия «${name}» №${num}`;
  };

  const buildGovernmentOrgsCheck = (state, out) => {
    const s = state.governmentOrgsCheck;
    if (!state.meta.checklist.governmentOrgsCheck) {
      out.push(notDone('7.1', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.checks.find(c => has(c.date))?.date;
    out.push(sectionHeader('7.1', firstDate));

    s.checks.forEach((c, i) => {
      const link = linkTc(c.videoLink, c.timecode);
      out.push(`${ordinal(i + 1)} проверка государственных организаций — ${link}:`);

      if (!c.orgs || !c.orgs.length) {
        out.push('—');
      } else {
        c.orgs.forEach(o => {
          const parts = [];
          if (has(o.verdict)) {
            parts.push(o.verdict.endsWith('.') ? o.verdict : o.verdict + '.');
          }
          if (has(o.comment)) parts.push(o.comment);
          const text = parts.join(' ') || '—';
          out.push(`${o.name} (Сотрудников: ${o.members} | Сотрудников вне рабочего места: ${o.offDuty}): ${text}`);
        });
      }
      out.push('');
    });

    if (s.leadersTalks.length) {
      out.push('Беседы с лидерами:');
      s.leadersTalks.forEach(t => {
        let line = `${t.leader}: ${t.text}`;
        if (has(t.evidence)) line += ` (Доказательства — ${t.evidence})`;
        out.push(line);
      });
      out.push('');
    }

    const stats = computeGovernmentOrgsStats(s);
    if (stats.rows.length) {
      out.push('Вывод:');
      stats.rows.forEach(r => {
        out.push(`${r.name}: Среднее количество сотрудников: ${round1(r.avgM)} | ` +
          `Среднее количество сотрудников вне рабочего места: ${round1(r.avgOff)} | ` +
          `Средний процент сотрудников вне рабочего места: ${round1(r.pct)}%.`);
      });
      out.push('');
      out.push('Общий вердикт по всем организациям:');
      out.push(`Среднее количество сотрудников: ${round1(stats.allM)}.`);
      out.push(`Среднее количество сотрудников вне рабочего места: ${round1(stats.allOff)}.`);
      out.push(`Средний процент сотрудников вне рабочего места: ${round1(stats.allPct)}%.`);
      out.push('');
    }
  };

  const computeGovernmentOrgsStats = s => {
    const map = {};
    s.checks.forEach(c => (c.orgs || []).forEach(o => {
      if (!has(o.name)) return;
      if (!map[o.name]) map[o.name] = { m: [], off: [] };
      map[o.name].m.push(+o.members || 0);
      map[o.name].off.push(+o.offDuty || 0);
    }));

    const rows = Object.keys(map).map(name => {
      const m = map[name].m;
      const off = map[name].off;
      const avgM = m.reduce((a, b) => a + b, 0) / m.length;
      const avgOff = off.reduce((a, b) => a + b, 0) / off.length;
      const pct = avgM > 0 ? (avgOff / avgM) * 100 : 0;
      return { name, avgM, avgOff, pct };
    });

    const allM = rows.length ? rows.reduce((a, r) => a + r.avgM, 0) / rows.length : 0;
    const allOff = rows.length ? rows.reduce((a, r) => a + r.avgOff, 0) / rows.length : 0;
    const allPct = allM > 0 ? (allOff / allM) * 100 : 0;

    return { rows, allM, allOff, allPct };
  };

  const buildIllegalEventsObservation = (state, out) => {
    const s = state.illegalEventsObservation;
    if (!state.meta.checklist.illegalEventsObservation) {
      out.push(notDone('7.2', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.events.find(e => has(e.date))?.date;
    out.push(sectionHeader('7.2', firstDate));

    let prevDate = firstDate;
    s.events.forEach((e, i) => {
      if (has(e.date) && e.date !== prevDate) {
        if (prevDate !== null) out.push('');
        out.push(`📅 ${formatDateLong(e.date)}:`);
        prevDate = e.date;
      }

      const link = linkTc(e.videoLink, e.timecode);
      const timePart = has(e.time) ? ` (${e.time})` : '';
      const num = computeEventNumber(s.events, i);
      const label = eventLabel(e, num);
      out.push(`${label}${timePart} — ${link}:`);
      out.push(has(e.comment) ? e.comment : '—');
      out.push(`ℹ️ Участники мероприятия: ${dash(e.participants)}.`);
      out.push(`ℹ️ Победитель: ${dash(e.winner)}.`);
      out.push(`ℹ️ Активность мероприятия: ${dash(e.activity)}.`);
      out.push('');
    });

    if (has(s.conclusion)) {
      out.push(`Вывод: ${s.conclusion}`);
      out.push('');
    }
  };

  const buildComplaintsReview = (state, out) => {
    const s = state.complaintsReview;
    if (!state.meta.checklist.complaintsReview) {
      out.push(notDone('7.3', s.failReason));
      out.push('');
      return;
    }

    out.push(sectionHeader('7.3', s.date));

    const badCount = s.badAnswers.length;
    const ovCount  = s.overdue.length;

    if (has(s.videoLink) || has(s.timecode)) {
      let desc = 'Проверка разделов жалоб. Были проверены все разделы жалоб, ';
      desc += badCount
        ? `найдены ${badCount} некачественных ответов`
        : 'некачественных ответов не найдено';
      desc += ' и ';
      desc += ovCount
        ? `${ovCount} просроченных жалоб (рассмотрение более 24 часов)`
        : 'просроченных жалоб не найдено';
      desc += '.';
      out.push(`${linkTc(s.videoLink, s.timecode)} — ${desc}`);
    }

    if (badCount) {
      out.push('');
      out.push('Некачественные ответы:');
      groupBySection(s.badAnswers).forEach((items, sec) => {
        out.push(`Раздел «${sec}»:`);
        items.forEach(b => out.push(`${b.link} — ${b.description}`));
      });
    }

    if (ovCount) {
      out.push('');
      out.push('Просроченные жалобы:');
      groupBySection(s.overdue).forEach((items, sec) => {
        out.push(`Раздел «${sec}»:`);
        items.forEach(o => out.push(`${o.link} — ${o.description}`));
      });
    }

    if (has(s.conclusion)) {
      out.push('');
      out.push(`Вывод: ${s.conclusion}`);
    }
    out.push('');
  };

  const groupBySection = arr => {
    const m = new Map();
    arr.forEach(x => {
      const k = x.section || '—';
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(x);
    });
    return m;
  };

  const buildCallsConduct = (state, out) => {
    const s = state.callsConduct;
    if (!state.meta.checklist.callsConduct) {
      out.push(notDone('7.4', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.calls.find(c => has(c.date))?.date;
    out.push(sectionHeader('7.4', firstDate));

    if (!s.calls.length) {
      out.push('Данные не внесены.');
    } else {
      let prevDate = firstDate;
      s.calls.forEach(c => {
        if (has(c.date) && c.date !== prevDate) {
          if (prevDate !== null) out.push('');
          out.push(`📅 ${formatDateLong(c.date)}:`);
          prevDate = c.date;
        }
        out.push(`Проведение обзвона — ${linkTc(c.videoLink, c.timecode)}. ${c.description}`);
      });
    }
    out.push('');
  };

  const buildAdminsWorkControl = (state, out) => {
    const s = state.adminsWorkControl;
    if (!state.meta.checklist.adminsWorkControl) {
      out.push(notDone('7.5', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.tasks.find(t => has(t.date))?.date;
    out.push(sectionHeader('7.5', firstDate));

    let prevDate = firstDate;
    s.tasks.forEach(t => {
      if (has(t.date) && t.date !== prevDate) {
        if (prevDate !== null) out.push('');
        out.push(`📅 ${formatDateLong(t.date)}:`);
        prevDate = t.date;
      }

      out.push(`Выдача задания ${t.assignee}: ${t.text}.`);
      let statusLine = `Статус выполнения задания: ${t.status}.`;
      if (has(t.comment)) statusLine += ` ${t.comment}.`;
      if (has(t.evidence)) {
        statusLine += ` Видеодоказательства проверки — ${linkTc(t.evidence, t.evidenceTimecode)}.`;
      }
      out.push(statusLine);
      out.push('');
    });

    if (has(s.conclusion)) {
      out.push(`Вывод: ${s.conclusion}`);
      out.push('');
    }
  };

  const buildCommunicationRecords = (state, out) => {
    const s = state.communicationRecords;
    if (!state.meta.checklist.communicationRecords) {
      out.push(notDone('7.6', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.records.find(r => has(r.date))?.date;
    out.push(sectionHeader('7.6', firstDate));

    let prevDate = firstDate;
    s.records.forEach(r => {
      if (has(r.date) && r.date !== prevDate) {
        if (prevDate !== null) out.push('');
        out.push(`📅 ${formatDateLong(r.date)}:`);
        prevDate = r.date;
      }

      let line = `${r.description} — ${linkTc(r.link, r.timecode)}.`;
      if (has(r.details)) line += ` ${r.details}`;
      out.push(line);
    });
    out.push('');
  };

  const buildMappingCheck = (state, out) => {
    const s = state.mappingCheck;
    if (!state.meta.checklist.mappingCheck) {
      out.push(notDone('7.7', s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.checks.find(c => has(c.date))?.date;
    out.push(sectionHeader('7.7', firstDate));

    if (has(s.delegation)) {
      out.push(`Делегирование задания на администратора ${s.delegation}.`);
    }

    let prevDate = firstDate;
    s.checks.forEach(c => {
      if (has(c.date) && c.date !== prevDate) {
        if (prevDate !== null) out.push('');
        out.push(`📅 ${formatDateLong(c.date)}:`);
        prevDate = c.date;
      }
      out.push(`${c.description} — ${linkTc(c.videoLink, c.timecode)}.`);
    });

    if (has(s.conclusion)) {
      out.push('');
      out.push(`Вывод: ${s.conclusion}`);
    }
    out.push('');
  };

  const buildChecksSection = (state, out, sectionId, taskKey) => {
    const s = state[sectionId];
    if (!state.meta.checklist[sectionId]) {
      out.push(notDone(taskKey, s.failReason));
      out.push('');
      return;
    }

    const firstDate = s.checks.find(c => has(c.date))?.date;
    out.push(sectionHeader(taskKey, firstDate));

    let prevDate = firstDate;
    s.checks.forEach(c => {
      if (has(c.date) && c.date !== prevDate) {
        if (prevDate !== null) out.push('');
        out.push(`📅 ${formatDateLong(c.date)}:`);
        prevDate = c.date;
      }

      let line = `${c.description} — ${linkTc(c.videoLink, c.timecode)}.`;
      if (has(c.comment)) line += ` ${c.comment}`;
      if (has(c.tableLink)) line += ` Таблица с проверенной информацией — ${c.tableLink}.`;
      out.push(line);
    });

    if (has(s.conclusion)) {
      out.push('');
      out.push(`Вывод: ${s.conclusion}`);
    }
    out.push('');
  };

  const buildTopHousesLogs = (state, out) => buildChecksSection(state, out, 'topHousesLogs', '7.8');
  const buildApartmentsLogsCheck = (state, out) => buildChecksSection(state, out, 'apartmentsLogsCheck', '7.10');

  const buildAdminsLogsCheck = (state, out) => {
    const s = state.adminsLogsCheck;
    if (!state.meta.checklist.adminsLogsCheck) {
      out.push(notDone('7.9', s.failReason));
      out.push('');
      return;
    }

    out.push(sectionHeader('7.9', s.date));

    let line = `${s.description} — ${linkTc(s.videoLink, s.timecode)}.`;
    if (has(s.details)) line += ` ${s.details}`;
    if (has(s.tableLink)) line += ` Таблица с проверенной информацией — ${s.tableLink}.`;
    out.push(line);

    if (has(s.conclusion)) {
      out.push('');
      out.push(`Вывод: ${s.conclusion}`);
    }
    out.push('');
  };

  const buildTeamTasks = (state, out) => {
    state.teamTasks.forEach(t => {
      if (!state.meta.checklist[t.id]) return;

      const firstDate = t.records.find(r => has(r.date))?.date;

      let header = `✅ Командное задание №${t.number}:`;
      if (has(firstDate)) header += ` 📅 ${formatDateLong(firstDate)}:`;
      out.push(header);

      if (!t.records.length) {
        out.push('');
        return;
      }

      let prevDate = firstDate;
      t.records.forEach(r => {
        if (has(r.date) && r.date !== prevDate) {
          if (prevDate !== null) out.push('');
          out.push(`📅 ${formatDateLong(r.date)}:`);
          prevDate = r.date;
        }

        let line;
        if (has(r.link)) {
          line = `${r.description} — ${linkTc(r.link, r.timecode)}.`;
        } else {
          line = has(r.description) ? `${r.description}.` : '';
        }
        if (has(r.details)) line += (line ? ' ' : '') + r.details;
        if (line) out.push(line);
      });

      if (has(t.conclusion)) {
        out.push('');
        out.push(`Вывод: ${t.conclusion}`);
      }
      out.push('');
    });
  };

  const buildWeeklyStreams = (state, out) => {
    if (!state.weeklyStreams.length) return;
    out.push('✅ Стримы за неделю:');
    state.weeklyStreams.forEach(s => {
      if (has(s.link)) {
        const dur = fmtDuration(s.hours, s.minutes, s.seconds);
        out.push(`🕙 ${s.day} — ${s.link} (${dur}).`);
      } else if (has(s.note)) {
        out.push(`🕙 ${s.day} — ${s.note}.`);
      }
    });
    out.push('');
  };

  const generate = state => {
    if (!state) return '';
    const out = [];

    out.push(`Дата с ${fmtDateRu(state.meta.weekStart)} по ${fmtDateRu(state.meta.weekEnd)}.`);
    out.push('');

    buildGovernmentOrgsCheck(state, out);
    buildIllegalEventsObservation(state, out);
    buildComplaintsReview(state, out);
    buildCallsConduct(state, out);
    buildAdminsWorkControl(state, out);
    buildCommunicationRecords(state, out);
    buildMappingCheck(state, out);
    buildTopHousesLogs(state, out);
    buildAdminsLogsCheck(state, out);
    buildApartmentsLogsCheck(state, out);
    buildTeamTasks(state, out);
    buildWeeklyStreams(state, out);

    const cleaned = [];
    let previousWasBlank = false;
    for (const line of out) {
      const isBlank = line === '';
      if (isBlank && previousWasBlank) continue;
      cleaned.push(line);
      previousWasBlank = isBlank;
    }
    while (cleaned.length && cleaned[cleaned.length - 1] === '') cleaned.pop();

    return cleaned.join('\n') + '\n';
  };

  return { generate };
})();